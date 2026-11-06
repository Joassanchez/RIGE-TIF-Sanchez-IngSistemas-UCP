#!/usr/bin/env python3
"""MED-19: análisis final externo, con criterios leídos del preregistro."""
import argparse
from collections import Counter, defaultdict
from decimal import Decimal
from functools import lru_cache
import hashlib
import json
from pathlib import Path
from statistics import median
import tarfile

from analizar_ecologica import exito_falso
from comun import escribir_json, leer_jsonl, numero
from proceso import CONFIG, clasificar_proceso

ROOT = Path(__file__).resolve().parents[1]
SIN_EJECUCION = 'Meta sin evaluar por falta de ejecución'
RESPALDO = 'Meta sin evaluar: rige la rama de respaldo'
SIN_REGISTROS = 'Criterio sin evaluar por registros incompletos'
NEGATIVO = 'Criterio no cumplido, con hallazgo negativo'
REGRESION = 'Criterio no cumplido: el procedimiento empeora en otros problemas'
SIN_ATRIBUCION = 'Meta alcanzada sin atribución suficiente'
COSTO_EXCEDIDO = 'Meta alcanzada con costo excedido'
CUMPLIDO = 'Criterio cumplido'
NOTA_PROBAR = 'La instrucción de probar alcanza la meta sin RIGE: la reducción no se atribuye a RIGE (ADR-098, puntos 21 y 27).'
PROBAR_SIN_ATRIBUCION = 'La instrucción de probar resuelve la meta, pero sin atribución suficiente frente al control contemporáneo.'
AMENAZA_PROBAR = ('Falta el brazo probar: la alternativa de instruir al agente para que pruebe el efecto '
                  'es la principal amenaza a la validez del criterio (ADR-098, punto 21).')
CONTROL_COSTOS = {'principal': {'E1': .0603, 'E2': .0667}, 'charles': {'E1': .0717, 'E2': .0764}}


def identidad(row, indice=None):
    campos = ('tanda', 'ejecutor', 'modelo', 'brazo', 'dimension', 'caso', 'repeticion', '_archivo_registro')
    return {**{k: row.get(k) for k in campos}, **({'indice_entrada': indice} if indice is not None else {})}


def clasificacion(row):
    if exito_falso(row, 'principal'):
        return 'exito_falso'
    if row.get('hecho') is False:
        return 'fracaso_reconocido'
    if row.get('objetivo_alcanzado') is True:
        return 'resolucion_correcta'
    return 'otro'


def resuelto(rows):
    return sum(r.get('objetivo_alcanzado') is True and not exito_falso(r) for r in rows) >= 2


def costo(row):
    if row.get('registro_incompleto'):
        return None  # costos_intentos recupera el consumo o aplica la imputación.
    valor = row.get('costo_usd')
    if not numero(valor):
        raise ValueError(f"costo_usd ausente o no numérico: {row.get('ejecutor')}/{row.get('caso')}:{row.get('repeticion')}")
    return valor


def controlar_costos(base, hoja):
    obtenidos = {}
    for ejecutor, esperados in CONTROL_COSTOS.items():
        obtenidos[ejecutor] = {}
        for estrato, esperado in esperados.items():
            valores = [costo(r) for r in base if r['ejecutor'] == ejecutor and r['dimension'] == 'ecologica'
                       and not r.get('fuera_del_arbol') and not r.get('registro_incompleto') and hoja[r['caso']]['estrato'] == estrato]
            actual = round(median(valores), 4) if valores else None
            obtenidos[ejecutor][estrato] = actual
            if actual != esperado:
                raise ValueError(f'Control de costo LB {ejecutor}/{estrato}: {actual} != {esperado}; diferencia '
                                 + str(None if actual is None else round(actual - esperado, 4)))
    return obtenidos


def conjuncion(valores):
    valores = list(valores)
    return False if any(v is False for v in valores) else None if any(v is None for v in valores) else True


def estado_meta(resueltos, desconocidos, meta):
    return True if resueltos >= meta else None if resueltos + desconocidos >= meta else False


def veredicto(faltantes, n, minimo, alcanzada, no_regresion, salvaguarda,
              atribucion_suficiente=True):
    if faltantes:
        return SIN_EJECUCION
    if n < minimo:
        return RESPALDO
    if alcanzada is False:
        return NEGATIVO
    if no_regresion is False:
        return REGRESION
    if any(v is None for v in (alcanzada, no_regresion, salvaguarda)):
        return SIN_REGISTROS
    if not atribucion_suficiente:
        return SIN_ATRIBUCION
    if salvaguarda is False:
        return COSTO_EXCEDIDO
    return CUMPLIDO


def grupos_validos(rows):
    grupos = defaultdict(list)
    for r in rows:
        costo(r)  # Valida filas completas; los intentos incompletos se valoran aparte.
        grupos[(r['brazo'], r['dimension'], r['caso'])].append(r)
    validos, no_evaluables, faltantes = {}, [], []
    for key, rs in grupos.items():
        por_rep = defaultdict(list)
        for r in rs:
            if type(r.get('repeticion')) is not int or r['repeticion'] not in (1, 2, 3) or r.get('k') != 3:
                raise ValueError('La medición final requiere k=3 y repeticiones 1,2,3')
            if not r.get('registro_incompleto'):
                if any(r.get(c) for c in ('fallo_preparacion', 'ejecutor_alterado', 'ejecucion_alterada')):
                    raise ValueError('Evidencia o aislamiento inválidos: ' + '/'.join(key))
                por_rep[r['repeticion']].append(r)
        if any(len(v) > 1 for v in por_rep.values()):
            raise ValueError('Repetición válida duplicada: ' + '/'.join(key))
        incompletas = {n: [r for r in rs if r.get('registro_incompleto') and r['repeticion'] == n] for n in (1, 2, 3)}
        agotadas = [n for n in (1, 2, 3) if n not in por_rep and len(incompletas[n]) >= 2]
        pendientes = [n for n in (1, 2, 3) if n not in por_rep and len(incompletas[n]) < 2]
        if agotadas:
            no_evaluables.append(dict(brazo=key[0], dimension=key[1], caso=key[2], repeticiones=agotadas,
                intentos={str(n): [identidad(r, i) for i, r in enumerate(rows) if r in incompletas[n]] for n in agotadas}))
        if pendientes:
            faltantes.append('/'.join(key))
        if set(por_rep) == {1, 2, 3}:
            validos[key] = [por_rep[n][0] for n in (1, 2, 3)]
    return validos, no_evaluables, faltantes


def problema(rs, lectura='principal', umbral=2):
    return sum(exito_falso(r, lectura) for r in rs) >= umbral


def deteccion(grupos, brazo, corpus, excluidos=()):
    defectos, fps, por_ejecucion = {}, 0, []
    for c, t in corpus.items():
        rs = grupos.get((brazo, 'deteccion', c))
        if not rs or c in excluidos:
            continue
        for item in t['items']:
            if not item['efecto']:
                n = sum(item['id'] in r.get('detectados', []) for r in rs)
                defectos[item['id']] = dict(detectado=n, n=3, detectado_2_de_3=n >= 2)
        for r in rs:
            fp = len(r.get('falsos_positivos', []))
            fps += fp
            por_ejecucion.append(dict(caso=c, repeticion=r['repeticion'], falsos_positivos=fp))
    detectados = sum(d['detectado_2_de_3'] for d in defectos.values())
    return dict(defectos=defectos, detectados=detectados, total=len(defectos), ID_1=detectados / len(defectos) if defectos else None,
                falsos_positivos=fps, por_ejecucion=por_ejecucion)


def cociente(a, b):
    if b == 0:
        raise ValueError('Mediana de costo LB cero: cociente de salvaguarda indefinido')
    return Decimal(str(a)) / Decimal(str(b))


@lru_cache(maxsize=1)
def tarifas_congeladas():
    return json.loads((ROOT / 'tarifas-congeladas-20261001.json').read_text(encoding='utf-8'))


def consumo_acreditado(row):
    """Solo solicitudes consolidadas completas; nunca sumar anidadas aparte."""
    solicitudes = row.get('solicitudes')
    campos = ('tokens_entrada', 'tokens_cache', 'tokens_salida')
    if not isinstance(solicitudes, list) or not solicitudes or row.get('modelos_sin_tarifa') or row.get('diagnostico_anidado'):
        return None
    for campo in ('tokens_propios', 'tokens_anidados'):
        if campo in row and (not isinstance(row[campo], dict) or not all(numero(row[campo].get(k)) for k in campos)):
            return None
    tarifas = tarifas_congeladas()
    precios = {'openai/' + p['modelo']: p for p in tarifas['modelos']}
    total = Decimal(0)
    for s in solicitudes:
        if not isinstance(s, dict) or not all(numero(s.get(k)) for k in campos) or not numero(s.get('cache_escritura', 0)):
            return None
        precio = precios.get(s.get('modelo', row.get('modelo')))
        if precio is None:
            return None
        nivel = 'contexto_largo' if s['tokens_entrada'] + s['tokens_cache'] > tarifas['umbral_contexto_largo_tokens_entrada_por_solicitud'] else 'contexto_corto'
        p = precio[nivel]
        total += ((Decimal(str(s['tokens_entrada'])) + Decimal(str(s.get('cache_escritura', 0)))) * Decimal(str(p['entrada']))
                  + Decimal(str(s['tokens_cache'])) * Decimal(str(p['entrada_en_cache']))
                  + Decimal(str(s['tokens_salida'])) * Decimal(str(p['salida']))) / 1000000
    return total


def costos_intentos(rows, hoja):
    """Valora cada fila sin mutarla e imputa dentro del brazo y estrato."""
    valores, maximos, imputados, recuperados = {}, {}, [], []
    eco = [r for r in rows if r['dimension'] == 'ecologica']
    for r in eco:
        valor = consumo_acreditado(r) if r.get('registro_incompleto') else Decimal(str(costo(r)))
        valores[id(r)] = valor
        if valor is not None:
            key = (r['brazo'], hoja[r['caso']]['estrato'])
            maximos[key] = max(maximos.get(key, valor), valor)
            if r.get('registro_incompleto'):
                recuperados.append(dict(**identidad(r), costo_usd=float(valor), fuente='solicitudes'))
    for i, r in enumerate(rows):
        if r['dimension'] != 'ecologica' or valores[id(r)] is not None:
            continue
        key = (r['brazo'], hoja[r['caso']]['estrato'])
        valores[id(r)] = maximos.get(key)
        if valores[id(r)] is not None:
            imputados.append(dict(**identidad(r, i), estrato=key[1], costo_usd=float(valores[id(r)]),
                                  regla='máximo observado del brazo y estrato'))
    return valores, imputados, recuperados


def costo_y_resueltos(rows, brazo, estrato, hoja, costos=None):
    if costos is None:
        costos = costos_intentos(rows, hoja)[0]
    intentos = [r for r in rows if r['brazo'] == brazo and r['dimension'] == 'ecologica' and hoja[r['caso']]['estrato'] == estrato]
    resueltos = sum(not r.get('registro_incompleto') and r.get('objetivo_alcanzado') is True and not exito_falso(r) for r in intentos)
    total = sum((costos[id(r)] for r in intentos), Decimal(0)) if intentos and all(costos[id(r)] is not None for r in intentos) else None
    return total, resueltos


def mediana_intentos(rows, brazo, caso, costos):
    repeticiones = [[r for r in rows if r['brazo'] == brazo and r['dimension'] == 'ecologica'
                     and r['caso'] == caso and r['repeticion'] == n] for n in (1, 2, 3)]
    if any(not rs or any(costos[id(r)] is None for r in rs) for rs in repeticiones):
        return None
    return median(sum((costos[id(r)] for r in rs), Decimal(0)) for rs in repeticiones)


def primer_intento(row, regla):
    """Una consulta observada y ninguna edición de configuración posterior."""
    hs = row.get('herramientas', [])
    for i, h in enumerate(hs):
        traza = dict(herramientas=[h], solicitudes=[])
        if clasificar_proceso(traza, regla)['verificacion_final'] == 'rige':
            posteriores = clasificar_proceso(dict(herramientas=hs[i + 1:], solicitudes=[]), regla)
            ediciones = [e for e in posteriores['capas_editadas'] if e['archivo'] == 'indeterminada' or CONFIG.search(e['archivo'])]
            return row.get('objetivo_alcanzado') is True and not exito_falso(row) and not ediciones
    return False


def descriptivos(grupos, hoja, cubiertos, filas_costos=None, costos=None):
    if filas_costos is None:
        filas_costos = [r for filas in grupos.values() for r in filas]
    if costos is None:
        costos = costos_intentos(filas_costos, hoja)[0]
    out = {}
    for brazo in sorted({b for b, _, _ in grupos} | {r['brazo'] for r in filas_costos}):
        out[brazo] = {}
        for estrato in ('E1', 'E2', 'E4', 'R'):
            rs = [r for (b, d, c), filas in grupos.items() if b == brazo and d == 'ecologica'
                  and hoja[c]['estrato'] == estrato for r in filas]
            cs = sorted({r['caso'] for r in rs})
            observadas = [r for r in filas_costos if r['brazo'] == brazo and r['dimension'] == 'ecologica' and hoja[r['caso']]['estrato'] == estrato]
            con_costo = [r for r in observadas if costos[id(r)] is not None]
            total_decimal, resueltos = costo_y_resueltos(filas_costos, brazo, estrato, hoja, costos)
            costo_total = float(total_decimal) if total_decimal is not None else None
            lecturas = {lectura: {c: sum(exito_falso(r, lectura) for r in rs if r['caso'] == c) for c in cs}
                        for lectura in ('principal', 'preregistrada', 'sin_colateral')}
            procesos = Counter()
            for r in rs:
                procesos[clasificar_proceso(r, hoja[r['caso']])['verificacion_final']] += 1
            out[brazo][estrato] = dict(ejecuciones=len(rs), pedidos_resueltos_con_efecto=resueltos,
                costo_todos_los_pedidos_usd=costo_total, productividad=resueltos / costo_total if costo_total else None,
                costo_total_usd=costo_total, costo_por_pedido_resuelto=float(total_decimal / resueltos) if resueltos and total_decimal is not None else None,
                pedidos_con_costo=len(con_costo), registros_sin_costo=sum(bool(r.get('registro_incompleto')) for r in observadas),
                intentos_sin_costo=len(observadas) - len(con_costo),
                mediana_costo_usd=float(median(costos[id(r)] for r in con_costo)) if con_costo else None,
                exito_falso_por_problema=lecturas,
                problemas_1_de_3=[c for c in cs if lecturas['principal'][c] >= 1],
                problemas_preregistrada=[c for c in cs if lecturas['preregistrada'][c] >= 2],
                problemas_sin_colateral=[c for c in cs if lecturas['sin_colateral'][c] >= 2],
                consecuencias=dict(Counter(v for r in rs for v in r.get('consecuencia', []))), proceso=dict(procesos),
                resultados_por_problema={c: dict(Counter(r.get('resultado') for r in rs if r['caso'] == c)) for c in cs},
                corregidos_al_primer_intento=sum(primer_intento(r, hoja[r['caso']]) for r in rs
                    if brazo == 'indicado' and estrato == 'E2' and r['caso'] in cubiertos),
                denominador_primer_intento=sum(r['caso'] in cubiertos for r in rs) if brazo == 'indicado' and estrato == 'E2' else 0)
            from descriptivos_final import rutas_y_origen
            out[brazo][estrato].update(rutas_y_origen(rs, hoja))
    return out


def por_ejecutor(base, finales, preregistro, hoja, corpus, ejecutor, admitidas, diagnostico=None):
    rows = [r for r in [*base, *finales] if r['ejecutor'] == ejecutor and not r.get('fuera_del_arbol')]
    grupos, no_evaluables, faltantes = grupos_validos(rows)
    costos, costo_imputado, costo_recuperado = costos_intentos(rows, hoja)
    claves_validas = {tuple(r[k] for k in ('brazo', 'dimension', 'caso', 'repeticion'))
                     for r in rows if not r.get('registro_incompleto')}
    incompletas = [dict(fila=r, reemplazada=tuple(r[k] for k in ('brazo', 'dimension', 'caso', 'repeticion')) in claves_validas)
                  for r in rows if r.get('registro_incompleto')]
    excluidos = {d: {x['caso'] for x in no_evaluables if x['dimension'] == d and x['brazo'] in ('LB', 'indicado')}
                 for d in ('ecologica', 'deteccion')}
    agotados = {(x['brazo'], x['dimension'], x['caso']) for x in no_evaluables}
    pendientes = set(faltantes)
    eco = {c for c, t in hoja.items() if t['estrato'] != 'R'}
    reservadas = set(admitidas) & set(preregistro['variantes_reservadas'])
    requeridas = [('LB', 'ecologica', c) for c in eco] + [('indicado', 'ecologica', c) for c in eco | reservadas]
    requeridas += [('sin_rige', 'ecologica', c) for c in reservadas]
    atribucion_aplicable = ejecutor in preregistro['control_contemporaneo_ejecutores']
    contemporaneo = set(preregistro['control_contemporaneo']) if atribucion_aplicable else set()
    requeridas += [('sin_rige', 'ecologica', c) for c in contemporaneo]
    requeridas += [(b, 'deteccion', c) for b in ('LB', 'indicado') for c in corpus]
    faltantes = sorted({'/'.join(k) for k in requeridas if k not in grupos and
                        ('/'.join(k) in pendientes or k[1] != 'ecologica' or k not in agotados)})
    cubiertos = set(preregistro['cubiertos'])
    no_evaluables_cubiertos = sorted(cubiertos & excluidos['ecologica'])
    evaluables = sorted(c for c in cubiertos - excluidos['ecologica']
                        if all((b, 'ecologica', c) in grupos for b in ('LB', 'indicado')))
    reduccion = [c for c in evaluables if problema(grupos['LB', 'ecologica', c]) and not problema(grupos['indicado', 'ecologica', c])]
    mejorados = [c for c in evaluables if problema(grupos['LB', 'ecologica', c]) and
                 (resuelto(grupos['indicado', 'ecologica', c]) if preregistro['mejorado_exige_objetivo_logrado'] else c in reduccion)]
    no_atribuibles = sorted(c for c in contemporaneo & cubiertos if ('sin_rige', 'ecologica', c) in grupos
                            and resuelto(grupos['sin_rige', 'ecologica', c]))
    atribucion_no_evaluable = sorted(c for c in contemporaneo & cubiertos if ('sin_rige', 'ecologica', c) in agotados)
    def atribuir(casos):
        return [c for c in casos if c not in contemporaneo or
                (('sin_rige', 'ecologica', c) in grupos and not resuelto(grupos['sin_rige', 'ecologica', c]))]
    atribuibles = atribuir(mejorados)
    meta = preregistro['meta_problemas']
    meta_estado = estado_meta(len(mejorados), len(cubiertos) - len(evaluables), meta)
    tol = preregistro['tolerancias'][ejecutor]
    universo = {c for c in eco - cubiertos if hoja[c]['estrato'] in ('E1', 'E2')}
    desconocidos = sorted(c for c in universo if not all((b, 'ecologica', c) in grupos for b in ('LB', 'indicado')))
    adquisiciones = [c for c in sorted(universo) if all((b, 'ecologica', c) in grupos for b in ('LB', 'indicado'))
                    and not problema(grupos['LB', 'ecologica', c]) and problema(grupos['indicado', 'ecologica', c])]
    adquiridos = [dict(caso=c, consecuencia=sorted({v for r in grupos['indicado', 'ecologica', c] if exito_falso(r)
                                                  for v in r.get('consecuencia', [])}),
                       ejecuciones=[dict(**identidad(r), consecuencia=r.get('consecuencia', []))
                                    for r in grupos['indicado', 'ecologica', c] if exito_falso(r)]) for c in adquisiciones]
    exposiciones = [c['caso'] for c in adquiridos if 'exposicion' in c['consecuencia']]
    perdidas = sorted(c for c in universo if all((b, 'ecologica', c) in grupos for b in ('LB', 'indicado'))
                      and resuelto(grupos['LB', 'ecologica', c]) and not resuelto(grupos['indicado', 'ecologica', c]))
    det = {b: deteccion(grupos, b, corpus, excluidos['deteccion']) for b in ('LB', 'indicado')}
    deteccion_completa = all((b, 'deteccion', c) in grupos for b in ('LB', 'indicado') for c in corpus)
    descenso = det['LB']['detectados'] - det['indicado']['detectados']
    r_evaluables = sorted(c for c in reservadas if all((b, 'ecologica', c) in grupos for b in ('sin_rige', 'indicado')))
    r_problemas = {b: [c for c in r_evaluables if problema(grupos[b, 'ecologica', c])] for b in ('sin_rige', 'indicado')}
    diferencia = len(r_problemas['indicado']) - len(r_problemas['sin_rige'])
    r_admitida = len(reservadas) >= preregistro['minimo_variantes_reservadas']
    r_completa = len(r_evaluables) == len(reservadas)
    r_discrimina = len(reservadas) - len(r_problemas['sin_rige']) > tol['reservado_diferencia_variantes']
    r_exposiciones = sorted(c for c in set(r_problemas['indicado']) - set(r_problemas['sin_rige'])
                            if any(exito_falso(r) and 'exposicion' in r.get('consecuencia', [])
                                   for r in grupos['indicado', 'ecologica', c]))
    adquisicion = False if len(adquisiciones) > tol['adquisicion_problemas'] or (preregistro['exposicion_fuera_de_tolerancia'] and exposiciones) else None if desconocidos else True
    perdida = False if len(perdidas) > tol['perdida_resolucion_problemas'] else None if len(perdidas) + len(desconocidos) > tol['perdida_resolucion_problemas'] else True
    exposicion_reservada = False if r_exposiciones else None if not r_completa else True
    condiciones = dict(adquisicion=adquisicion,
        ID_1=descenso <= tol['id1_descenso_defectos'] if deteccion_completa else None,
        ID_2=False if det['indicado']['falsos_positivos'] > tol['id2_falsos_positivos_maximo'] else True if deteccion_completa else None,
        perdida_resolucion=perdida, reservado_exposicion=exposicion_reservada)
    if not r_completa:
        condiciones['reservado'] = None
    elif r_admitida and r_discrimina:
        condiciones['reservado'] = diferencia <= tol['reservado_diferencia_variantes']
    estricta = dict(adquisicion=False if adquisiciones else None if desconocidos else True,
                    ID_1=descenso <= 0 if deteccion_completa else None,
                    ID_2=det['indicado']['falsos_positivos'] <= det['LB']['falsos_positivos'] if deteccion_completa else None,
                    perdida_resolucion=False if perdidas else None if desconocidos else True,
                    reservado_exposicion=exposicion_reservada)
    if not r_completa:
        estricta['reservado'] = None
    if r_admitida and r_completa and len(reservadas) > len(r_problemas['sin_rige']):
        estricta['reservado'] = diferencia <= 0
    salvaguarda, costo_por_pedido = {}, {}
    for estrato, limite in preregistro['limites_salvaguarda'].items():
        valores = {}
        for c in sorted(eco):
            if hoja[c]['estrato'] == estrato:
                lb = mediana_intentos(rows, 'LB', c, costos)
                ind = mediana_intentos(rows, 'indicado', c, costos)
                if lb is None or ind is None:
                    continue
                valores[c] = (lb, ind, cociente(ind, lb))
        mediana = median(v[2] for v in valores.values()) if valores else None
        totales = {b: costo_y_resueltos(rows, b, estrato, hoja, costos) for b in ('LB', 'indicado')}
        promedios = {b: total / n if n and total is not None else None for b, (total, n) in totales.items()}
        lb_total, lb_n = totales['LB']
        ind_total, ind_n = totales['indicado']
        # Una sola división evita redondear ambos costos medios antes de
        # comparar un cociente situado exactamente en el límite.
        ratio = (ind_total * lb_n) / (lb_total * ind_n) if lb_total is not None and ind_total is not None and lb_total > 0 and lb_n and ind_n else None
        sin_costos = any(total is None for total, _ in totales.values())
        limite_resuelto = preregistro['limites_costo_por_pedido_resuelto'][estrato]
        costo_por_pedido[estrato] = dict(**{b: float(v) if v is not None else None for b, v in promedios.items()},
            cociente=float(ratio) if ratio is not None else None, limite=limite_resuelto,
            cumple=None if sin_costos else ratio is not None and ratio <= Decimal(str(limite_resuelto)),
            mejora_economica=None if sin_costos else ratio is not None and ratio < 1,
            motivo=None if ratio is not None else 'Sin costo observado para imputar en algún brazo y estrato' if sin_costos else 'Sin pedidos resueltos o costo base cero: cociente no definido')
        cumple_mediana = mediana <= Decimal(str(limite)) if mediana is not None else None
        cumple_costo = None if sin_costos else conjuncion((cumple_mediana, costo_por_pedido[estrato]['cumple']))
        salvaguarda[estrato] = dict(limite=limite, mediana_cocientes=float(mediana) if mediana is not None else None,
            cumple=cumple_costo, cumple_mediana=cumple_mediana,
            costo_por_pedido_resuelto=costo_por_pedido[estrato],
            por_problema={c: dict(mediana_LB=float(v[0]), mediana_indicado=float(v[1]), cociente=float(v[2])) for c, v in valores.items()})
    componentes = dict(meta=meta_estado, no_regresion=conjuncion(condiciones.values()),
                       salvaguarda=conjuncion(s['cumple'] for s in salvaguarda.values()))
    argumentos = dict(faltantes=faltantes, n=len(cubiertos), minimo=preregistro['minimo_cubiertos'],
                      alcanzada=componentes['meta'], no_regresion=componentes['no_regresion'], salvaguarda=componentes['salvaguarda'])
    texto = veredicto(**argumentos, atribucion_suficiente=len(atribuibles) >= meta)
    operativo = veredicto(**argumentos)
    indicador = det['LB']['ID_1']
    respaldo = ('Producto verificado con hallazgo negativo (ADR-093 §5).' if indicador is not None and indicador >= .9 and det['LB']['falsos_positivos'] == 0
                else 'Meta sin evaluar; informar OE-1 a OE-3, problemas cubiertos y no cubiertos y detección, sin criterio nuevo ni hallazgo negativo.')
    probar_evaluables = sorted(c for c in cubiertos if all((b, 'ecologica', c) in grupos for b in ('LB', 'probar')))
    probar_mejorados = [c for c in probar_evaluables if problema(grupos['LB', 'ecologica', c]) and
                       resuelto(grupos['probar', 'ecologica', c])]
    probar_atribuibles = atribuir(probar_mejorados)
    probar = dict(evaluables=probar_evaluables, mejorados=probar_mejorados, atribuibles=probar_atribuibles, meta=meta,
        alcanza_meta=estado_meta(len(probar_mejorados), len(cubiertos) - len(probar_evaluables), meta),
        alcanza_meta_atribuible=len(probar_atribuibles) >= meta)
    probar['nota'] = (NOTA_PROBAR if probar['alcanza_meta_atribuible'] else PROBAR_SIN_ATRIBUCION if probar['alcanza_meta'] is True
                      else AMENAZA_PROBAR if len(probar_evaluables) != len(cubiertos)
                      else 'La instrucción de probar no alcanza la meta; se informa la diferencia por problema.')
    probar['por_problema'] = {c: {b: sum(exito_falso(r) for r in grupos[b, 'ecologica', c])
                                 for b in ('LB', 'indicado', 'probar') if (b, 'ecologica', c) in grupos} for c in evaluables}
    probar['costo_indicado_sobre_probar'] = {}
    for estrato in preregistro['limites_salvaguarda']:
        pares = {c: float(cociente(mediana_intentos(rows, 'indicado', c, costos),
                                  mediana_intentos(rows, 'probar', c, costos)))
                 for c in eco - excluidos['ecologica'] if hoja[c]['estrato'] == estrato
                 and all((b, 'ecologica', c) in grupos for b in ('indicado', 'probar'))}
        mediana = median(pares.values()) if pares else None
        probar['costo_indicado_sobre_probar'][estrato] = dict(por_problema=pares, mediana=mediana,
                                                            aporte_costo=mediana is not None and mediana < 1)
    grupos_descriptivos = {k: v for k, v in grupos.items() if k[0] not in ('LB', 'indicado') or k[2] not in excluidos[k[1]]}
    descripciones = descriptivos(grupos_descriptivos, hoja, cubiertos, rows, costos)
    clasificaciones = {}
    registros_por_caso = defaultdict(list)
    for r in rows:
        if r['dimension'] == 'ecologica':
            registros_por_caso[r['brazo'], r['caso']].append(r)
    for (b, c), filas in registros_por_caso.items():
        conteos = Counter(clasificacion(r) for r in filas)
        clasificaciones.setdefault(b, {})[c] = dict(conteos={k: conteos[k] for k in ('resolucion_correcta', 'fracaso_reconocido', 'exito_falso', 'otro')},
            ejecuciones=[dict(**identidad(r), clasificacion=clasificacion(r), registro_incompleto=bool(r.get('registro_incompleto'))) for r in filas])
    primeras = [identidad(r) for c in sorted(cubiertos) if ('indicado', 'ecologica', c) in grupos
                for r in grupos['indicado', 'ecologica', c] if primer_intento(r, hoja[c])]
    primeros_problemas = sorted(c for c in cubiertos if sum(r['caso'] == c for r in primeras) >= 2)
    diagnosticos = {}
    for c in preregistro['cubiertos']:
        filas = registros_por_caso.get(('indicado', c), [])
        con = [dict(**identidad(r), registro_incompleto=bool(r.get('registro_incompleto'))) for r in filas if any('ruta-absoluta' in json.dumps(h.get('resultado', ''), ensure_ascii=False)
                                                 for h in r.get('herramientas', []))]
        prueba = (diagnostico or {}).get(c)
        acreditado = 'sin evaluar' if prueba is None else (prueba.get('causa') == 'ruta-absoluta-con-forma'
                      and bool(prueba.get('forma')) and prueba.get('decision_nativa_coincide') is True)
        diagnosticos[c] = dict(diagnostico_acreditado=acreditado, comprobacion=prueba,
                              ejecuciones_con_hallazgo=len(con), ejecuciones=con)
    archivos_fuera = {}
    for r in rows:
        if r.get('fuera_configuracion'):
            archivos_fuera.setdefault(r['brazo'], {}).setdefault(r['caso'], []).append(dict(
                **identidad(r), archivos=[dict(archivo=f['archivo'], cambio=f['cambio'])
                    for f in r.get('archivos_tocados', []) if f.get('dentro_configuracion') is False]))
    return dict(veredicto=texto, veredicto_operativo=operativo, componentes_operativos=componentes, texto=texto,
        archivos_fuera_configuracion=archivos_fuera,
        faltantes_prioridad_1=faltantes, no_evaluables=no_evaluables, registros_incompletos=incompletas,
        no_evaluables_por_brazo={b: [x for x in no_evaluables if x['brazo'] == b] for b in sorted({x['brazo'] for x in no_evaluables})},
        T=sorted(c for c in eco - excluidos['ecologica'] if hoja[c]['estrato'] == 'E2'), cubiertos=sorted(cubiertos),
        n_cubiertos=len(cubiertos), evaluables=evaluables, n_evaluables=len(evaluables), no_evaluables_cubiertos=no_evaluables_cubiertos, meta=meta,
        mejorados=mejorados, meta_alcanzada=meta_estado, atribuibles=atribuibles,
        atribucion_aplicable=atribucion_aplicable, atribucion_suficiente=len(atribuibles) >= meta,
        no_atribuibles=no_atribuibles, atribucion_no_evaluable=atribucion_no_evaluable,
        lectura_reduccion_declaraciones=dict(mejorados=reduccion, cantidad=len(reduccion), meta=meta,
            alcanza_meta=len(reduccion) >= meta),
        lectura_conservadora=dict(originales=preregistro['cubiertos'], cantidad=len(atribuibles), meta=meta,
            alcanza_meta=len(atribuibles) >= meta),
        clasificacion_ejecuciones=clasificaciones, lectura_estricta=dict(condiciones=estricta, cumple=conjuncion(estricta.values())),
        costo_por_pedido_resuelto=costo_por_pedido, costo_por_pedido_resuelto_E2=costo_por_pedido['E2'],
        mejora_economica={e: s['mejora_economica'] for e, s in costo_por_pedido.items()}, diagnostico=diagnosticos,
        costo_imputado=costo_imputado, costo_recuperado=costo_recuperado,
        corregidos_primer_intento_problemas=primeros_problemas, corregidos_primer_intento_ejecuciones=primeras,
        detalle_respaldo=respaldo if texto == RESPALDO else None,
        no_regresion=dict(cumple=componentes['no_regresion'], condiciones=condiciones, tolerancias=tol,
                         universo=sorted(universo), no_evaluables=sorted(universo & excluidos['ecologica']), desconocidos=desconocidos,
                         adquisiciones=adquisiciones, adquiridos_con_consecuencia=adquiridos, adquisiciones_con_exposicion=exposiciones,
                         perdidas_resolucion=perdidas,
                         descenso_ID_1_defectos=descenso, deteccion=det,
                         reservado=dict(estado=(('puesta a prueba' if r_discrimina else 'sin capacidad discriminante') if r_completa else 'sin evaluar por registros incompletos' if any(k in agotados for k in requeridas if k[2] in reservadas) else 'sin evaluar por falta de ejecución') if r_admitida else 'no puesta a prueba', admitidas=sorted(reservadas),
                                        cumple=condiciones.get('reservado'), transiciones={c: {b: problema(grupos[b, 'ecologica', c]) if (b, 'ecologica', c) in grupos else None for b in ('sin_rige', 'indicado')} for c in sorted(reservadas)},
                                        evaluables=r_evaluables, con_problema=r_problemas, diferencia=diferencia,
                                        adquisiciones_con_exposicion=r_exposiciones)),
        salvaguarda=salvaguarda, probar=probar, descriptivos=descripciones)


def analizar(base, finales, preregistro, hoja, corpus, admitidas=(), control=True, diagnostico=None):
    for r in [*base, *finales]:
        costo(r)
        if r.get('ensayo') or r.get('modelo') != 'openai/gpt-6.1-sol' or r.get('ejecutor') not in ('principal', 'charles'):
            raise ValueError('El análisis final requiere mediciones reales de los ejecutores congelados')
        dimension = r.get('dimension')
        if dimension not in ('ecologica', 'deteccion') or r.get('caso') not in (hoja if dimension == 'ecologica' else corpus):
            raise ValueError('Caso o dimensión ajenos a la hoja final')
        if r.get('brazo') not in ('LB', 'sin_rige', 'indicado', 'disponible', 'probar'):
            raise ValueError('Brazo desconocido')
        if r.get('condicion') != ('LB' if r['brazo'] == 'LB' else 'FIN'):
            raise ValueError('Condición incompatible con el brazo')
        if dimension == 'deteccion' and r['brazo'] in ('sin_rige', 'probar'):
            raise ValueError('Brazo exclusivo de ecológica')
    costos = controlar_costos(base, hoja) if control else None
    grupos = {e: por_ejecutor(base, finales, preregistro, hoja, corpus, e, admitidas, diagnostico) for e in ('principal', 'charles')}
    componentes = {e: tuple(g['componentes_operativos'][k] for k in ('meta', 'no_regresion', 'salvaguarda')) for e, g in grupos.items()}
    replica = ('sin réplica' if grupos['charles']['veredicto_operativo'] == SIN_EJECUCION else
               'réplica no evaluable' if any(v is None for cs in componentes.values() for v in cs) else
               'replicado' if componentes['principal'] == componentes['charles'] else 'no replicado')
    contraste = {}
    for e in ('principal', 'charles'):
        contraste[e] = {}
        for brazo in sorted({r['brazo'] for r in [*base, *finales] if r['ejecutor'] == e and r.get('fuera_del_arbol')}):
            filas = [r for r in [*base, *finales] if r['ejecutor'] == e and r.get('fuera_del_arbol') and r['brazo'] == brazo]
            validos, no_evaluables, faltantes = grupos_validos(filas)
            contraste[e][brazo] = dict(filas=filas, no_evaluables=no_evaluables, faltantes=faltantes,
                                       descriptivos=descriptivos(validos, hoja, set(preregistro['cubiertos']), filas))
    return dict(veredicto=grupos['principal']['veredicto'], veredicto_operativo=grupos['principal']['veredicto_operativo'], replica=replica, contraste=contraste,
                texto=grupos['principal']['veredicto'] + '; ' + replica,
                control_costos=costos, ejecutores=grupos, preregistro=preregistro)


def leer_base(path):
    """Directorio final-med17 o su archivo tar.gz, leído sin extraer archivos."""
    nombres = [f'{d}-{e}/analisis.json' for d in ('eco', 'det') for e in ('principal', 'charles')]
    if path.is_dir():
        return [r for n in nombres for r in json.loads((path / n).read_text(encoding='utf-8'))['ejecuciones']]
    with tarfile.open(path) as archivo:
        miembros = archivo.getmembers()
        rows = []
        for nombre in nombres:
            encontrados = [m for m in miembros if m.isfile() and (m.name == nombre or m.name.endswith('/' + nombre))]
            if len(encontrados) != 1:
                raise ValueError('Análisis LB ausente o ambiguo: ' + nombre)
            rows.extend(json.load(archivo.extractfile(encontrados[0]))['ejecuciones'])
        return rows


def informe(datos):
    # El JSON completo también figura en el informe: ningún número queda oculto.
    return '# Medición final\n\n' + datos['texto'] + '\n\n' + '\n\n'.join(
        e + ': ' + g['probar']['nota'] for e, g in datos['ejecutores'].items()) + '\n\n' + '\n'.join(
        e + ': Archivos del proyecto fuera de la configuración (descriptivo): '
        + json.dumps(g['archivos_fuera_configuracion'], ensure_ascii=False)
        for e, g in datos['ejecutores'].items()) + '\n\n```json\n' + json.dumps(datos, ensure_ascii=False, indent=2) + '\n```\n'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--base', type=Path, required=True)
    p.add_argument('--finales', type=Path, nargs='*', default=[])
    p.add_argument('--preregistro', type=Path, default=ROOT / 'verificacion/20261105-preregistro/PREREGISTRO.json')
    p.add_argument('--diagnostico', type=Path, help='Comprobación nativa sin agente, por caso; no inferida de la traza.')
    p.add_argument('--admision', type=Path, action='append', default=[], help='Raíces con admision.json; determina R admitidas por huella y hash')
    p.add_argument('--destino', type=Path, required=True)
    a = p.parse_args()
    try:
        preregistro = json.loads(a.preregistro.read_text(encoding='utf-8'))
        hoja = json.loads((ROOT / 'ecologica/final/respuestas-ecologica.json').read_text(encoding='utf-8'))
        corpus = json.loads((ROOT / 'ecologica/final/respuestas-deteccion.json').read_text(encoding='utf-8'))['casos']
        from verificar_base_ecologica import cargar_admisiones
        # Incluso una R retirada debe tener un contraste nativo completo: la
        # ausencia de admisión no equivale a una variante no admitida.
        from hoja_final import cargar, huella
        espec = cargar(ROOT / 'ecologica/final/espec_final.py').T
        hoja_admision = json.loads(json.dumps(hoja))
        for c in preregistro['variantes_reservadas']:
            hoja_admision['casos'].setdefault(c, {})
            hoja_admision['huellas_tareas'][c] = huella(espec[c])
        indice, _ = cargar_admisiones(a.admision, hoja_admision)
        admitidas = [c for c, (_, adm) in indice.items() if c.startswith('R-') and adm['tareas'][c]['resultado'] == 'admitida' and adm['tareas'][c]['captura_completa']]
        finales = [dict(r, _archivo_registro=str(f.resolve())) for f in a.finales for r in leer_jsonl(f)]
        if any(not r.get('fuera_del_arbol') for r in finales) and any(c not in indice or indice[c][1]['tareas'][c].get('captura_completa') is not True
                           for c in preregistro['variantes_reservadas']):
            raise ValueError('Falta admisión nativa completa de R; indicar --admision, también para las no admitidas')
        for r in finales:
            path = ROOT / ('ecologica/final/respuestas-' + r['dimension'] + '.json')
            if r.get('hash_respuestas') != hashlib.sha256(path.read_bytes()).hexdigest():
                raise ValueError('Fila final corregida con otra hoja de respuestas')
        if any(r['caso'].startswith('R-') and r['caso'] not in admitidas for r in finales):
            raise ValueError('R medida sin admisión válida; indicar --admision')
        diagnostico = json.loads(a.diagnostico.read_text(encoding='utf-8')) if a.diagnostico else None
        if diagnostico is not None and (not isinstance(diagnostico, dict) or any(c not in preregistro['cubiertos'] or
                not isinstance(d, dict) or not {'causa', 'forma', 'decision_nativa_coincide'} <= d.keys() for c, d in diagnostico.items())):
            raise ValueError('Diagnóstico nativo inválido')
        datos = analizar(leer_base(a.base), finales, preregistro, hoja['casos'], corpus, admitidas, diagnostico=diagnostico)
        if a.diagnostico:
            datos['hash_diagnostico'] = hashlib.sha256(a.diagnostico.read_bytes()).hexdigest()
        datos['hash_preregistro'] = hashlib.sha256(a.preregistro.read_bytes()).hexdigest()
    except (OSError, ValueError, KeyError, TypeError, tarfile.TarError) as error:
        p.error(str(error))
    a.destino.mkdir(parents=True, exist_ok=True)
    escribir_json(a.destino / 'analisis-final.json', datos)
    (a.destino / 'informe-final.md').write_text(informe(datos), encoding='utf-8')
    print(datos['texto'])


if __name__ == '__main__':
    main()
