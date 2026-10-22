#!/usr/bin/env python3
"""Proveedor OpenAI chat/completions determinista, sólo biblioteca estándar."""
import json
import threading
import time
from http.server import BaseHTTPRequestHandler
from pathlib import Path


class Proveedor:
    def __init__(self, plan, accion, registro):
        self.plan = plan
        self.accion = accion
        self.registro = Path(registro)
        self.lock = threading.Lock()

    def log(self, evento, **datos):
        with self.lock, self.registro.open("a", encoding="utf-8") as archivo:
            archivo.write(json.dumps({"evento": evento, "hora": time.time(), **datos},
                                     ensure_ascii=False) + "\n")

    def respuesta(self, cuerpo):
        mensajes = cuerpo.get("messages", [])
        usuarios = [m.get("content", "") for m in mensajes if m.get("role") == "user"]
        hijo = "MED4A_CHILD" in json.dumps(usuarios[-1] if usuarios else "")
        etapa = "hijo" if hijo else "principal"
        accion = next(a for a in self.plan["acciones"] if a["id"] == self.accion)
        llamadas = accion.get("hijo", []) if hijo else accion["llamadas"]
        resultados = [m for m in mensajes if m.get("role") == "tool"]
        ofrecidas = [t.get("function", {}).get("name") for t in cuerpo.get("tools", [])]
        self.log("solicitud", etapa=etapa, accion=self.accion, toolsOffered=ofrecidas,
                 resultados=resultados, cuerpo=cuerpo)
        recibidos = {m.get("tool_call_id") for m in resultados}
        for indice, llamada in enumerate(llamadas):
            identificador = f"med4a_{etapa}_{self.accion}_{indice}"
            if identificador not in recibidos:
                tool = {"id": identificador, "type": "function", "function": {
                    "name": llamada["herramienta"],
                    "arguments": json.dumps(llamada["argumentos"], ensure_ascii=False)}}
                self.log("llamada", etapa=etapa, accion=self.accion,
                         objetivo=llamada.get("objetivo", False), tool=tool)
                return {"role": "assistant", "content": None, "tool_calls": [tool]}
        self.log("fin", etapa=etapa, accion=self.accion)
        return {"role": "assistant", "content": "MED4A_FIN"}


def manejador(proveedor):
    class Manejador(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def do_GET(self):
            if self.path == "/v1/models":
                contenido = json.dumps({"object": "list", "data": [
                    {"id": "permisos", "object": "model", "created": 0,
                     "owned_by": "simulado"}]}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(contenido)))
                self.end_headers()
                self.wfile.write(contenido)
                return
            if self.path == "/health":
                contenido = b"OK"
            elif self.path.startswith("/evidencia/"):
                token = self.path.removeprefix("/evidencia/")
                proveedor.log("efecto_http", ruta=self.path, token=token)
                contenido = token.encode("utf-8")
            else:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(contenido)))
            self.end_headers()
            self.wfile.write(contenido)

        def do_POST(self):
            if self.path != "/v1/chat/completions":
                self.send_error(404)
                return
            try:
                cuerpo = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                mensaje = proveedor.respuesta(cuerpo)
            except (ValueError, KeyError, StopIteration) as error:
                proveedor.log("error", detalle=str(error))
                self.send_error(400, "Solicitud o plan inválido")
                return
            identificador = "chatcmpl-med4a"
            base = {"id": identificador, "created": int(time.time()), "model": getattr(proveedor, "modelo", "permisos")}
            uso = getattr(proveedor, "uso", {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0})
            fin = "tool_calls" if "tool_calls" in mensaje else "stop"
            self.send_response(200)
            if cuerpo.get("stream"):
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                delta = dict(mensaje)
                if "tool_calls" in delta:
                    delta["tool_calls"] = [dict(t, index=i) for i, t in enumerate(delta["tool_calls"])]
                for d, razon in [(delta, None), ({}, fin)]:
                    fragmento = {**base, "object": "chat.completion.chunk", "choices": [
                        {"index": 0, "delta": d, "finish_reason": razon}]}
                    self.wfile.write(("data: " + json.dumps(fragmento) + "\n\n").encode())
                    self.wfile.flush()
                if hasattr(proveedor, "uso"):
                    self.wfile.write(("data: " + json.dumps({**base, "object": "chat.completion.chunk", "choices": [], "usage": uso}) + "\n\n").encode())
                self.wfile.write(b"data: [DONE]\n\n")
            else:
                contenido = json.dumps({**base, "object": "chat.completion", "choices": [
                    {"index": 0, "message": mensaje, "finish_reason": fin}],
                    "usage": uso}).encode()
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(contenido)))
                self.end_headers()
                self.wfile.write(contenido)
            self.close_connection = True
    return Manejador

