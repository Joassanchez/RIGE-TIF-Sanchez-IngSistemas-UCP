#!/usr/bin/env python3
"""Clasifica señales observadas; no contiene respuestas esperadas."""
import json
from pathlib import Path


ASK = "The user rejected permission to use this specific tool call"
DENY = "The user has specified a rule which prevents you"


def leer_json(ruta):
    return json.loads(Path(ruta).read_text(encoding="utf-8"))


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

