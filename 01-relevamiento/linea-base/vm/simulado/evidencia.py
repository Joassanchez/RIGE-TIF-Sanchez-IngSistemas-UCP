#!/usr/bin/env python3
"""Prepara acciones y clasifica señales observadas; no contiene respuestas esperadas."""
import argparse
import json
from pathlib import Path


ASK = "The user rejected permission to use this specific tool call"
DENY = "The user has specified a rule which prevents you"


def leer_json(ruta):
    return json.loads(Path(ruta).read_text(encoding="utf-8"))


def guardar(ruta, dato):
    Path(ruta).write_text(json.dumps(dato, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def reemplazar(dato, valores):
    if isinstance(dato, dict):
        return {k: reemplazar(v, valores) for k, v in dato.items()}
    if isinstance(dato, list):
        return [reemplazar(v, valores) for v in dato]
    if isinstance(dato, str):
        for clave, valor in valores.items():
            dato = dato.replace("${" + clave + "}", valor)
    return dato


def control(sin, con):
    # Comparar la lista entera en su orden; las claves de cada regla no tienen orden semántico.
    a, b = leer_json(sin)["permission"], leer_json(con)["permission"]
    if not isinstance(a, list) or not isinstance(b, list):
        raise ValueError("debug agent no devolvió una lista de permisos")
    return {"estado": "limpio" if a == b else "contaminado", "sin": a, "con": b,
            "regla": "Igualdad exacta de las listas permission, preservando el orden de reglas"}


def preparar(plan, proyecto, salida):
    proyecto = Path(proyecto)
    valores = {"PROJECT": str(proyecto)}
    # .env inocuo se crea en el escenario activo; las plantillas no se modifican ni se copian.
    (proyecto / ".env").write_text("MED4A_ENV_LOCAL=sin_credenciales\n", encoding="utf-8")
    (proyecto / "MED4A_STATUS").write_text("centinela local\n", encoding="utf-8")
    for accion in plan["acciones"]:
        efecto = accion["efecto"]
        if efecto["tipo"] == "edicion":
            anterior = (proyecto / efecto["archivo"]).read_text(encoding="utf-8")
            nuevo = anterior + ("\n<!-- " + efecto["token"] + " -->\n" if efecto["archivo"].endswith(".md")
                                else "\n// " + efecto["token"] + "\n")
            accion["llamadas"] = reemplazar(accion["llamadas"], {"OLD_TEXT": anterior, "NEW_TEXT": nuevo})
        if efecto.get("token") == "MED4A_DIFF":
            with (proyecto / "README.md").open("a", encoding="utf-8") as archivo:
                archivo.write("\nMED4A_DIFF\n")
    binario = proyecto / ".med4a-bin"
    binario.mkdir(exist_ok=True)
    npm = binario / "npm"
    npm.write_text('#!/bin/bash\nset -eu\n[[ $# -eq 1 && $1 == install ]] || exit 2\n'
                   'printf "MED4A_NPM_INSTALL\\n" > "${0%/*}/../MED4A_NPM_INSTALL"\n'
                   'echo MED4A_NPM_INSTALL\n', encoding="utf-8")
    npm.chmod(0o750)
    guardar(salida, reemplazar(plan, valores))


def jsonl(ruta):
    datos = []
    for linea in Path(ruta).read_text(encoding="utf-8", errors="replace").splitlines():
        try:
            datos.append(json.loads(linea))
        except json.JSONDecodeError:
            continue  # La salida cruda se conserva; estas líneas nunca acreditan una ejecución.
    return datos


def clasificar(plan, accion_id, registros, eventos, proyecto, codigo):
    accion = next(a for a in plan["acciones"] if a["id"] == accion_id)
    etapa = "hijo" if "hijo" in accion else "principal"
    llamadas = [r for r in registros if r.get("evento") == "llamada" and
                r.get("etapa") == etapa and r.get("objetivo")]
    decision, regla = "indeterminado", "No se acredita la llamada objetivo y su resultado"
    evidencia = {"solicitudes": 0, "resultados": [], "toolsOffered": [], "efecto": False}
    if llamadas:
        llamada = llamadas[-1]
        identificador = llamada["tool"]["id"]
        herramienta = llamada["tool"]["function"]["name"]
        solicitudes = [r for r in registros if r.get("evento") == "solicitud" and r.get("etapa") == etapa]
        # La oferta que cuenta es la de la solicitud inmediatamente anterior a la llamada objetivo.
        indice = registros.index(llamada)
        oferta = next((r["toolsOffered"] for r in reversed(registros[:indice])
                       if r.get("evento") == "solicitud" and r.get("etapa") == etapa), [])
        resultados = [m for r in solicitudes for m in r["resultados"]
                      if m.get("tool_call_id") == identificador]
        estados = [e["part"]["state"] for e in eventos
                   if e.get("part", {}).get("callID") == identificador and "state" in e["part"]]
        texto = json.dumps(resultados + estados, ensure_ascii=False)
        finalizo = any(r.get("evento") == "fin" and r.get("etapa") == etapa for r in registros)
        # Un rechazo puede cerrar run sin otra consulta al modelo: el evento terminal
        # crudo de la CLI también acredita el retorno, sin inventar un envío al proveedor.
        terminal_cli = any(s.get("status") in ("completed", "error") for s in estados)
        cadena = True
        if etapa == "hijo":
            tareas = [r["tool"] for r in registros if r.get("evento") == "llamada" and
                      r.get("etapa") == "principal" and r["tool"]["function"]["name"] == "task" and
                      json.loads(r["tool"]["function"]["arguments"]).get("subagent_type") == "general"]
            ids_padre = {t["id"] for t in tareas}
            retorno_padre = any(m.get("tool_call_id") in ids_padre for r in registros
                                if r.get("evento") == "solicitud" and r.get("etapa") == "principal"
                                for m in r["resultados"])
            cadena = bool(tareas) and retorno_padre and any(
                r.get("evento") == "fin" and r.get("etapa") == "principal" for r in registros)
        retorno = bool(resultados or estados)
        efecto = accion["efecto"]
        observado = False
        detalle = None
        if efecto["tipo"] == "edicion":
            archivo = Path(proyecto) / efecto["archivo"]
            detalle = archivo.read_text(encoding="utf-8") if archivo.exists() else None
            esperado = next(c["argumentos"]["newString"] for c in accion["llamadas"] if c.get("objetivo"))
            observado = detalle == esperado
        elif efecto["tipo"] == "escritura":
            archivo = Path(proyecto) / efecto['archivo']
            detalle = archivo.read_text(encoding='utf-8') if archivo.exists() else None
            observado = detalle == efecto['contenido']
        elif efecto["tipo"] == "http":
            detalle = [r for r in registros if r.get("evento") == "efecto_http" and r.get("token") == efecto["token"]]
            observado = bool(detalle) and efecto["token"] in texto
        elif efecto["tipo"] == "npm":
            archivo = Path(proyecto) / efecto["token"]
            detalle = archivo.read_text(encoding="utf-8") if archivo.exists() else None
            observado = detalle == efecto["token"] + "\n" and efecto["token"] in texto
        elif efecto["tipo"] == "bash_completado":
            # MED-9 mide la ejecución del bash, no su texto de salida ni el
            # éxito del comando. Un retorno al proveedor también acredita el
            # fin de la herramienta del hijo (no siempre visible en stdout).
            detalle = resultados + estados
            observado = (herramienta == "bash" and herramienta in oferta and
                         (bool(resultados) or any(s.get("status") == "completed" for s in estados)) and
                         not any(s.get("status") == "error" for s in estados) and
                         ASK not in texto and DENY not in texto and "Error:" not in texto)
        else:
            detalle = resultados + estados
            observado = efecto["token"] in texto
        evidencia = {"callID": identificador, "herramienta": herramienta, "etapa": etapa,
                     "solicitudes": len(solicitudes), "resultados": resultados, "estados": estados,
                     "toolsOffered": oferta, "efecto": observado, "detalleEfecto": detalle,
                     "finProveedor": finalizo, "terminalCLI": terminal_cli,
                     "cadenaTaskGeneral": cadena, "codigoRun": codigo}
        rechazo = ASK in texto or DENY in texto
        error = any(s.get("status") == "error" for s in estados) or "Error:" in texto
        if codigo != 0 or not (finalizo or terminal_cli) or not retorno or not cadena:
            regla = "Run falló, intercambio incompleto, falta resultado objetivo o cadena task -> general"
        elif observado and not rechazo and not error:
            decision, regla = "allow", "Resultado objetivo sin error y efecto observable acreditado"
            if efecto["tipo"] == "bash_completado":
                regla = "Bash ofrecido y completado sin rechazo/error; no se exige token en su salida"
        elif observado:
            regla = "Señales contradictorias: efecto observable junto a un rechazo/error"
        elif ASK in texto and DENY in texto:
            regla = "Señales contradictorias: textos de ask y deny en el resultado objetivo"
        elif ASK in texto:
            decision, regla = "ask", "Resultado objetivo contiene el texto de autorrechazo de ask"
        elif DENY in texto:
            decision, regla = "deny", "Resultado objetivo contiene el texto de denegación por regla"
        elif herramienta not in oferta:
            decision, regla = "deny", "La herramienta objetivo no fue ofrecida en su sesión; hay retorno de la llamada fija"
        else:
            regla = "Herramienta ofrecida, pero sin texto de decisión ni efecto suficiente"
    return {"accion": accion_id, "decision": decision, "regla": regla, "evidencia": evidencia}


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="comando", required=True)
    p = sub.add_parser("control")
    p.add_argument("sin"); p.add_argument("con"); p.add_argument("salida")
    p = sub.add_parser("preparar")
    p.add_argument("plan"); p.add_argument("proyecto"); p.add_argument("salida")
    p = sub.add_parser("config")
    p.add_argument("puerto", type=int); p.add_argument("salida")
    p = sub.add_parser("clasificar")
    p.add_argument("plan"); p.add_argument("accion"); p.add_argument("carpeta")
    p.add_argument("proyecto"); p.add_argument("codigo", type=int)
    args = parser.parse_args()
    if args.comando == "control":
        try:
            resultado = control(args.sin, args.con)
        except (ValueError, KeyError, OSError) as error:
            resultado = {"estado": "indeterminado", "error": str(error)}
        guardar(args.salida, resultado)
        raise SystemExit(0 if resultado["estado"] == "limpio" else 3)
    if args.comando == "preparar":
        preparar(leer_json(args.plan), args.proyecto, args.salida)
        # El proveedor es root; el plan de evidencia no necesita acceso del participante.
    elif args.comando == "config":
        guardar(args.salida, {"provider": {"simulado": {
            "npm": "@ai-sdk/openai-compatible", "name": "Simulado local",
            "options": {"baseURL": f"http://127.0.0.1:{args.puerto}/v1"},
            "models": {"permisos": {"name": "Permisos simulado",
                                     "limit": {"context": 32000, "output": 2048}}}}},
            "model": "simulado/permisos"})
    else:
        carpeta = Path(args.carpeta)
        resultado = clasificar(leer_json(args.plan), args.accion, jsonl(carpeta / "proveedor.jsonl"),
                               jsonl(carpeta / "run.stdout.jsonl"), args.proyecto, args.codigo)
        guardar(carpeta / "clasificacion.json", resultado)
        print(resultado["decision"])


if __name__ == "__main__":
    main()
