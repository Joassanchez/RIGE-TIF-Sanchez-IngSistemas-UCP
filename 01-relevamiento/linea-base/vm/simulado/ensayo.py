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

    def __init__(self, plan, accion, registro):
        super().__init__(plan, accion, registro)
        self.lecturas = plan.get('lecturas', [])
        self.lecturas_confirmadas = set()

    def leer_documentacion(self, cuerpo):
        resultados = {m.get('tool_call_id'): m for m in cuerpo.get('messages', []) if m.get('role') == 'tool'}
        for i, path in enumerate(self.lecturas):
            identificador = f'med9_documentacion_{i}'
            if identificador not in resultados:
                return {'role': 'assistant', 'content': None, 'tool_calls': [dict(
                    id=identificador, type='function', function=dict(name='read', arguments=json.dumps({'filePath': path})))]}
            texto = resultados[identificador].get('content', '')
            # OpenCode read acredita el archivo con su bloque de contenido.
            # Un error, rechazo o respuesta vacía nunca cuenta como lectura.
            if not isinstance(texto, str) or ('<file>' not in texto and '<content>' not in texto):
                raise ValueError(f'Lectura de documentación no confirmada: {path}')
            self.lecturas_confirmadas.add(path)
        return None

    def verificar_lecturas(self):
        if set(self.lecturas) != self.lecturas_confirmadas:
            raise ValueError('Ensayo sin todas las lecturas de documentación confirmadas.')

    def respuesta(self, cuerpo):
        self.log('solicitud_ensayo', cuerpo=cuerpo, uso_inventado=self.uso)
        lectura = self.leer_documentacion(cuerpo)
        if lectura:
            return lectura
        return {'role': 'assistant', 'content': 'ENSAYO: valores inventados.\n' + json.dumps(self.plan['salida'], ensure_ascii=False)}


class EnsayoModificacion(Ensayo):
    """Pide las ediciones a OpenCode: el proveedor nunca escribe el escenario."""
    def __init__(self, plan, accion, registro, home=Path('/home/participante')):
        super().__init__(plan, accion, registro)
        self.llamadas = []
        for rel, nuevo in plan['archivos'].items():
            if rel[:2] not in ('G/', 'P/') or '..' in Path(rel).parts or '.git' in Path(rel).parts:
                raise ValueError('Ruta de ensayo inválida')
            path = home / ('.config/opencode' if rel.startswith('G/') else 'proyecto') / rel[2:]
            anterior = path.read_text(encoding='utf-8') if path.exists() else ''
            if path.exists():
                self.llamadas.append(('read', dict(filePath=str(path))))
            self.llamadas.append(('edit', dict(filePath=str(path), oldString=anterior, newString=nuevo)))

    def respuesta(self, cuerpo):
        self.log('solicitud_ensayo_modificacion', cuerpo=cuerpo, uso_inventado=self.uso)
        lectura = self.leer_documentacion(cuerpo)
        if lectura:
            return lectura
        recibidos = {m.get('tool_call_id') for m in cuerpo.get('messages', []) if m.get('role') == 'tool'}
        for i, (nombre, args) in enumerate(self.llamadas):
            identificador = f'med6_{i}'
            if identificador not in recibidos:
                return {'role': 'assistant', 'content': None, 'tool_calls': [
                    dict(id=identificador, type='function', function=dict(name=nombre, arguments=json.dumps(args, ensure_ascii=False)))]}
        salida = self.plan['salida']
        return {'role': 'assistant', 'content': 'ENSAYO: valores inventados.\n' +
                (json.dumps(salida, ensure_ascii=False) if isinstance(salida, dict) else salida)}


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
    clase = EnsayoModificacion if datos.get('dimension') == 'modificacion' else Ensayo
    provider = clase(datos['casos'][a.caso], 'ensayo', a.registro)
    server = ThreadingHTTPServer(('127.0.0.1', 0), manejador(provider))
    a.listo.write_text(str(server.server_port), encoding='ascii')
    server.serve_forever()


if __name__ == '__main__':
    main()
