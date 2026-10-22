"""E/S y valorización compartidas por las herramientas externas (sin red)."""
import hashlib
import json
import math
from pathlib import Path

TOKEN_FIELDS = ('tokens_entrada', 'tokens_cache', 'tokens_salida')
RESULTADOS = ('correcta', 'parcial', 'incorrecta', 'sin_respuesta')


def leer_jsonl(path):
    return [json.loads(l) for l in Path(path).read_text(encoding='utf-8-sig').splitlines() if l.strip()]


def escribir_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')


def identificador(row):
    return '|'.join(str(row[k]) for k in ('tanda', 'ejecutor', 'modelo', 'brazo', 'caso', 'repeticion'))


def numero(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and value >= 0


def costo_solicitudes(solicitudes, modelo, tarifas):
    """Aplica contexto corto/largo POR SOLICITUD, nunca por sesión acumulada."""
    precio = next((p for p in tarifas['modelos'] if p['modelo'] == modelo.split('/')[-1]), None)
    if precio is None or not solicitudes:
        return None
    costo = 0
    for s in solicitudes:
        if not all(numero(s.get(k)) for k in TOKEN_FIELDS):
            return None
        entrada, cache, salida = (s[k] for k in TOKEN_FIELDS)
        nivel = 'contexto_largo' if entrada + cache > tarifas['umbral_contexto_largo_tokens_entrada_por_solicitud'] else 'contexto_corto'
        p = precio[nivel]
        costo += (entrada * p['entrada'] + cache * p['entrada_en_cache'] + salida * p['salida']) / 1_000_000
    return costo


def hash_archivo(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
