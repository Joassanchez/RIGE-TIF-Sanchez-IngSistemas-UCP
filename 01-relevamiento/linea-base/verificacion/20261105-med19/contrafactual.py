"""Ejecuta pruebas MED-19 contra HEAD en memoria; no cambia ningún archivo fuente."""
import io
import json
from pathlib import Path
import subprocess
import sys
from types import ModuleType
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'herramientas'), str(ROOT / 'vm/simulado')]
import test_med19_final as hoja
import test_med19_arnes as arnes


def anterior(rel):
    codigo = subprocess.check_output(['git', 'show', 'HEAD:01-relevamiento/linea-base/' + rel], cwd=ROOT)
    modulo = ModuleType('previo_med19')
    modulo.__file__ = str(ROOT / rel)
    exec(compile(codigo, modulo.__file__, 'exec'), modulo.__dict__)
    return modulo


def comprobar(nombre, prueba, sustitucion):
    salida = io.StringIO()
    with sustitucion:
        resultado = unittest.TextTestRunner(stream=salida).run(unittest.TestSuite([prueba]))
    errores = len(resultado.errors) + len(resultado.failures)
    if errores != 1:
        raise AssertionError('La prueba no detectó el código previo: ' + nombre + '\n' + salida.getvalue())
    return dict(prueba=nombre, corridas=resultado.testsRun, fallos_esperados=len(resultado.failures),
                errores_esperados=len(resultado.errors), detalle=salida.getvalue())


if __name__ == '__main__':
    viejo = anterior('vm/simulado/ecologica.py')
    admisiones = anterior('herramientas/verificar_base_ecologica.py')
    datos = [comprobar('S-3 y M-2', hoja.HojaTests('test_solo_cambia_correcta_S3_M2'), patch.object(hoja, 'NUEVA', hoja.BASE))]
    for nombre, metodo in [('Sondas R', 'test_sondas_R_cubren_objetivos_guardas_solo_desde_archivos'),
                           ('Instrucciones por brazo', 'test_instruccion_exacta_y_posicion'),
                           ('Planes finales', 'test_comandos_efectivamente_pedidos_al_proveedor_por_brazo')]:
        datos.append(comprobar(nombre, arnes.FinalTests(metodo), patch.object(arnes, 'eco', viejo)))
    datos.append(comprobar('Admisión por tarea', hoja.AdmisionesTests('test_herencia_por_tarea_y_referencias_corregidas'),
                          patch.object(hoja, 'cargar_admisiones', admisiones.cargar_admisiones)))
    path = Path(__file__).with_name('contrafactual.json')
    path.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(datos)} pruebas detectan el código previo; fuentes sin cambios.')
