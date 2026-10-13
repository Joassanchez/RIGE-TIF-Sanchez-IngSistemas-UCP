#!/usr/bin/env python3
"""Proveedor de MED-4b: valores y consumos INVENTADOS, nunca una hoja real."""
import argparse
import json
from http.server import ThreadingHTTPServer
from pathlib import Path

from proveedor import Proveedor, manejador


class Ensayo(Proveedor):
    modelo = 'medicion'
    uso = {'prompt_tokens': 120, 'completion_tokens': 30, 'total_tokens': 150,
           'prompt_tokens_details': {'cached_tokens': 20}}

    def respuesta(self, cuerpo):
        self.log('solicitud_ensayo', cuerpo=cuerpo, uso_inventado=self.uso)
        return {'role': 'assistant', 'content': 'ENSAYO: valores inventados.\n' + json.dumps(self.plan['salida'], ensure_ascii=False)}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--datos', required=True, type=Path)
    p.add_argument('--caso', required=True)
    p.add_argument('--registro', required=True)
    p.add_argument('--listo', required=True, type=Path)
    a = p.parse_args()
    datos = json.loads(a.datos.read_text(encoding='utf-8'))
    if datos.get('ensayo') is not True:
        p.error('El archivo debe declarar ensayo=true.')
    provider = Ensayo(datos['casos'][a.caso], 'ensayo', a.registro)
    server = ThreadingHTTPServer(('127.0.0.1', 0), manejador(provider))
    a.listo.write_text(str(server.server_port), encoding='ascii')
    server.serve_forever()


if __name__ == '__main__':
    main()
