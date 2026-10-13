"""Pruebas sin Docker, credenciales ni conexiones externas: python -B .../test_simulado.py."""
import copy
import http.client
import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path

from evidencia import ASK, DENY, clasificar, control, preparar
from proveedor import Proveedor, manejador


PLANES = Path(__file__).parent / "planes"


class SimuladoTest(unittest.TestCase):
    def setUp(self):
        self.temporal = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporal.cleanup)
        self.base = Path(self.temporal.name)
        self.log = self.base / "proveedor.jsonl"

    def plan(self, caso):
        return json.loads((PLANES / (caso + ".json")).read_text(encoding="utf-8"))

    def proveedor(self, caso, accion):
        return Proveedor(self.plan(caso), accion, self.log)

    def registros(self):
        return [json.loads(l) for l in self.log.read_text(encoding="utf-8").splitlines()]

    def intercambio(self, caso, accion, ofrecidas, salida, hijo=False):
        proveedor = self.proveedor(caso, accion)
        mensajes = [{"role": "user", "content": "MED4A_CHILD" if hijo else "MED4A_ROOT"}]
        cuerpo = {"messages": mensajes, "tools": [{"function": {"name": n}} for n in ofrecidas]}
        # Preparaciones (read) y objetivo, hasta que el proveedor termina.
        while True:
            respuesta = proveedor.respuesta(cuerpo)
            if "tool_calls" not in respuesta:
                break
            tool = respuesta["tool_calls"][0]
            mensajes.extend([respuesta, {"role": "tool", "tool_call_id": tool["id"], "content": salida}])
        return self.registros()

    def test_stream_y_resultado_en_registro(self):
        proveedor = self.proveedor("C-1b", "webfetch")
        servidor = ThreadingHTTPServer(("127.0.0.1", 0), manejador(proveedor))
        hilo = threading.Thread(target=servidor.serve_forever, daemon=True)
        hilo.start()
        self.addCleanup(servidor.server_close)
        self.addCleanup(hilo.join, 2)
        self.addCleanup(servidor.shutdown)
        conexion = http.client.HTTPConnection("127.0.0.1", servidor.server_port, timeout=3)
        self.addCleanup(conexion.close)
        cuerpo = {"stream": True, "messages": [{"role": "user", "content": "MED4A_ROOT"}],
                  "tools": [{"function": {"name": "webfetch"}}]}
        conexion.request("POST", "/v1/chat/completions", json.dumps(cuerpo), {"Content-Type": "application/json"})
        respuesta = conexion.getresponse()
        self.assertEqual(respuesta.status, 200)
        self.assertEqual(respuesta.getheader("Content-Type"), "text/event-stream")
        datos = respuesta.read().decode()
        self.assertIn("data: [DONE]", datos)
        fragmentos = [json.loads(l[6:]) for l in datos.splitlines() if l.startswith("data: {")]
        llamada = fragmentos[0]["choices"][0]["delta"]["tool_calls"][0]
        self.assertEqual(llamada["index"], 0)
        self.assertEqual(llamada["function"]["name"], "webfetch")
        self.assertEqual(fragmentos[-1]["choices"][0]["finish_reason"], "tool_calls")
        cuerpo["messages"].extend([{"role": "assistant", "tool_calls": [llamada]},
                                  {"role": "tool", "tool_call_id": llamada["id"], "content": ASK}])
        conexion.request("POST", "/v1/chat/completions", json.dumps(cuerpo), {"Content-Type": "application/json"})
        self.assertIn("MED4A_FIN", conexion.getresponse().read().decode())
        self.assertIn(ASK, json.dumps(self.registros()))
        conexion.request("GET", "/evidencia/MED4A_HTTP")
        self.assertEqual(conexion.getresponse().read(), b"MED4A_HTTP")
        self.assertTrue(any(r["evento"] == "efecto_http" for r in self.registros()))

    def test_subagente_no_confunde_task_del_padre_con_usuario_del_hijo(self):
        proveedor = self.proveedor("C-3f", "subagente")
        root = {"messages": [{"role": "user", "content": "MED4A_ROOT"}], "tools": [{"function": {"name": "task"}}]}
        task = proveedor.respuesta(root)
        self.assertEqual(task["tool_calls"][0]["function"]["name"], "task")
        hijo = {"messages": [{"role": "user", "content": "MED4A_CHILD git status"}], "tools": []}
        bash = proveedor.respuesta(hijo)
        self.assertEqual(json.loads(bash["tool_calls"][0]["function"]["arguments"])["command"], "git status")
        root["messages"].extend([task, {"role": "tool", "tool_call_id": task["tool_calls"][0]["id"], "content": "MED4A_FIN"}])
        self.assertEqual(proveedor.respuesta(root)["content"], "MED4A_FIN")

    def test_control_preserva_orden_de_lista(self):
        a, b = self.base / "a.json", self.base / "b.json"
        reglas = [{"pattern": "*", "action": "deny"}, {"pattern": "git *", "action": "allow"}]
        a.write_text(json.dumps({"permission": reglas}))
        b.write_text(json.dumps({"permission": copy.deepcopy(reglas)}))
        self.assertEqual(control(a, b)["estado"], "limpio")
        b.write_text(json.dumps({"permission": reglas[::-1]}))
        self.assertEqual(control(a, b)["estado"], "contaminado")

    def test_ask_deny_no_ofrecida_y_transporte_fallido(self):
        for caso, accion, ofrecidas, salida, esperado in [
            ("C-1b", "webfetch", ["webfetch"], ASK, "ask"),
            ("C-4b", "bash", ["bash"], DENY, "deny"),
            ("C-4b", "bash", [], "Invalid tool: bash", "deny"),
            ("C-4b", "bash", ["bash"], "Error: comando falló", "indeterminado")]:
            with self.subTest(caso=caso, salida=salida):
                self.log.unlink(missing_ok=True)
                registros = self.intercambio(caso, accion, ofrecidas, salida)
                self.assertEqual(clasificar(self.plan(caso), accion, registros, [], self.base, 0)["decision"], esperado)
                self.assertEqual(clasificar(self.plan(caso), accion, registros, [], self.base, 124)["decision"], "indeterminado")
        self.assertEqual(clasificar(self.plan("C-1b"), "webfetch", [], [], self.base, 0)["decision"], "indeterminado")

    def test_allow_necesita_efecto_y_resultado(self):
        registros = self.intercambio("C-4a", "bash", ["bash"], "On branch master: MED4A_STATUS")
        self.assertEqual(clasificar(self.plan("C-4a"), "bash", registros, [], self.base, 0)["decision"], "allow")
        self.log.unlink()
        registros = self.intercambio("C-1b", "webfetch", ["webfetch"], "MED4A_HTTP")
        self.assertEqual(clasificar(self.plan("C-1b"), "webfetch", registros, [], self.base, 0)["decision"], "indeterminado")
        registros.append({"evento": "efecto_http", "token": "MED4A_HTTP"})
        self.assertEqual(clasificar(self.plan("C-1b"), "webfetch", registros, [], self.base, 0)["decision"], "allow")

    def test_autorrechazo_terminal_cli_sin_segunda_solicitud_al_proveedor(self):
        proveedor = self.proveedor("C-1b", "webfetch")
        respuesta = proveedor.respuesta({"messages": [{"role": "user", "content": "MED4A_ROOT"}],
                                         "tools": [{"function": {"name": "webfetch"}}]})
        identificador = respuesta["tool_calls"][0]["id"]
        eventos = [{"type": "tool_use", "part": {"callID": identificador,
                    "state": {"status": "error", "error": ASK}}}]
        resultado = clasificar(self.plan("C-1b"), "webfetch", self.registros(), eventos, self.base, 0)
        self.assertEqual(resultado["decision"], "ask")
        self.assertFalse(resultado["evidencia"]["finProveedor"])
        self.assertTrue(resultado["evidencia"]["terminalCLI"])
        eventos[0]["part"]["state"] = {"status": "running"}
        self.assertEqual(clasificar(self.plan("C-1b"), "webfetch", self.registros(), eventos, self.base, 0)["decision"], "indeterminado")

    def test_edicion_lee_antes_y_verifica_contenido_exacto(self):
        (self.base / "src").mkdir()
        destino = self.base / "src/index.js"
        destino.write_text("const local = 1;\n", encoding="utf-8")
        preparado = self.base / "plan.json"
        preparar(self.plan("C-4c"), self.base, preparado)
        plan = json.loads(preparado.read_text(encoding="utf-8"))
        proveedor = Proveedor(plan, "editar", self.log)
        cuerpo = {"messages": [{"role": "user", "content": "MED4A_ROOT"}],
                  "tools": [{"function": {"name": "read"}}, {"function": {"name": "edit"}}]}
        read = proveedor.respuesta(cuerpo)
        self.assertEqual(read["tool_calls"][0]["function"]["name"], "read")
        cuerpo["messages"].extend([read, {"role": "tool", "tool_call_id": read["tool_calls"][0]["id"], "content": "const local = 1;"}])
        edit = proveedor.respuesta(cuerpo)
        nuevo = json.loads(edit["tool_calls"][0]["function"]["arguments"])["newString"]
        cuerpo["messages"].extend([edit, {"role": "tool", "tool_call_id": edit["tool_calls"][0]["id"], "content": "Edit applied successfully."}])
        proveedor.respuesta(cuerpo)
        self.assertEqual(clasificar(plan, "editar", self.registros(), [], self.base, 0)["decision"], "indeterminado")
        destino.write_text(nuevo, encoding="utf-8")
        self.assertEqual(clasificar(plan, "editar", self.registros(), [], self.base, 0)["decision"], "allow")

    def test_denegacion_del_hijo_usa_oferta_del_hijo(self):
        proveedor = self.proveedor("C-3f", "subagente")
        root = {"messages": [{"role": "user", "content": "MED4A_ROOT"}],
                "tools": [{"function": {"name": "task"}}, {"function": {"name": "bash"}}]}
        task = proveedor.respuesta(root)
        self.intercambio("C-3f", "subagente", [], "Invalid tool: bash", hijo=True)
        self.assertEqual(clasificar(self.plan("C-3f"), "subagente", self.registros(), [], self.base, 0)["decision"], "indeterminado")
        root["messages"].extend([task, {"role": "tool", "tool_call_id": task["tool_calls"][0]["id"], "content": "MED4A_FIN"}])
        proveedor.respuesta(root)
        registros = self.registros()
        resultado = clasificar(self.plan("C-3f"), "subagente", registros, [], self.base, 0)
        self.assertEqual(resultado["decision"], "deny")
        self.assertEqual(resultado["evidencia"]["etapa"], "hijo")
        self.assertEqual(resultado["evidencia"]["toolsOffered"], [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
