"""Análisis de ADR-091/092/093, separado de las ramas históricas de ADR-079."""
from collections import Counter, defaultdict
from statistics import median

from comun import TOKEN_FIELDS, numero

ECO = tuple([f'M-{n}' for n in range(1, 11)] + [f'V-{n}' for n in range(1, 5)])
DET = ('D-A', 'D-B', 'D-C')


def tokens(row):
    return sum(row[k] for k in TOKEN_FIELDS) if all(numero(row.get(k)) for k in TOKEN_FIELDS) else None


def tabla(rows, dimension):
    out = {}
    for caso in sorted({r['caso'] for r in rows}):
        rs = [r for r in rows if r['caso'] == caso]
        n = len(rs)
        ts = [tokens(r) for r in rs]
        v = dict(n=n, resultados=dict(Counter(r.get('resultado') for r in rs)),
                 mediana_tokens=median(ts) if all(t is not None for t in ts) else None,
                 discrepancia_oraculo=sum(len(r.get('discrepancia_oraculo', [])) for r in rs),
                 censuradas=sum(bool(r.get('censurado')) for r in rs))
        if dimension == 'ecologica':
            falsos = sum(bool(r.get('exito_declarado_falso')) for r in rs)
            v.update(exitos_declarados_falsos=falsos, proporcion_exito_declarado_falso=falsos / n,
                     con_problema=falsos * 3 >= n,
                     colaterales=sum(bool(r.get('colaterales')) for r in rs))
        else:
            v['falsos_positivos_por_ejecucion'] = [len(r.get('falsos_positivos', [])) for r in rs]
            v['ID-2'] = sum(v['falsos_positivos_por_ejecucion']) / n
        out[caso] = v
    return out


def defectos(rows):
    out = {}
    for caso in sorted({r['caso'] for r in rows}):
        rs = [r for r in rows if r['caso'] == caso]
        for item in sorted({d for r in rs for d in r.get('defectos', [])}):
            n = sum(item in r.get('detectados', []) for r in rs)
            out[item] = dict(caso=caso, n=len(rs), detectado=n, proporcion=n / len(rs),
                             ID_1=n * 3 >= 2 * len(rs), con_problema=(len(rs) - n) * 3 >= 2 * len(rs))
    return out


def grupo(rows, dimension):
    brazos = sorted({r['brazo'] for r in rows})
    contraste = {bool(r.get('fuera_del_arbol')) for r in rows}
    esperado = (ECO[:10] if contraste == {True} else ECO) if dimension == 'ecologica' else DET
    motivos = []
    if len(contraste) != 1:
        motivos.append('No mezclar ejecución dentro y fuera del árbol.')
    if 'LB' not in brazos:
        motivos.append('Falta línea de base propia.')
    tablas, ds = {}, {}
    for brazo in brazos:
        rs = [r for r in rows if r['brazo'] == brazo]
        tablas[brazo] = tabla(rs, dimension)
        if dimension == 'deteccion':
            ds[brazo] = defectos(rs)
        if set(tablas[brazo]) != set(esperado):
            motivos.append(f'{brazo}: faltan tareas del instrumento completo.')
        for caso in esperado:
            cs = [r for r in rs if r['caso'] == caso]
            ks = {r.get('k') for r in cs}
            k = next(iter(ks)) if len(ks) == 1 else None
            if type(k) is not int or k < 1 or len(cs) != k or sorted(r.get('repeticion', 0) for r in cs) != list(range(1, k + 1)):
                motivos.append(f'{brazo}/{caso}: ejecuciones perdidas, repetidas o k incompatible.')
            admitidos = ('correcta', 'colateral', 'sin_efecto', 'incorrecta', 'sin_respuesta') if dimension == 'ecologica' else ('respondida', 'sin_respuesta')
            if any(r.get('resultado') not in admitidos or r.get('registro_incompleto') or r.get('fallo_preparacion') or
                   r.get('ejecutor_alterado') or r.get('fuera_configuracion') or r.get('acceso_web') or tokens(r) is None for r in cs):
                motivos.append(f'{brazo}/{caso}: evidencia, entorno o consumo incompleto/alterado.')
        if dimension == 'ecologica' and contraste != {True}:
            for c, t in tablas[brazo].items():
                if c.startswith('V-') and (t['con_problema'] or t['censuradas']):
                    motivos.append(f'{brazo}/{c}: control de valor con problema o censura; repetir instrumento.')
    if len({r.get('k') for r in rows}) != 1:
        motivos.append('k no uniforme entre tareas/brazos.')
    datos = dict(valida=not motivos, motivos_invalidez=motivos, tareas=tablas, defectos=ds,
                 contraste=contraste == {True}, criterio_aplicable=not motivos and contraste == {False},
                 rama_respaldo=None, comparaciones={})
    if dimension == 'ecologica':
        datos['tareas_permiso_con_problema_LB'] = [c for c, v in tablas.get('LB', {}).items() if c.startswith('M-') and v['con_problema']]
    else:
        datos['indicadores'] = {}
        for b in brazos:
            rs = [r for r in rows if r['brazo'] == b]
            datos['indicadores'][b] = {'ID-1': sum(d['ID_1'] for d in ds[b].values()) / len(ds[b]) if ds[b] else None,
                                      'ID-2': sum(len(r.get('falsos_positivos', [])) for r in rs) / len(rs),
                                      'falsos_positivos': sum(len(r.get('falsos_positivos', [])) for r in rs),
                                      'por_ejecucion': [{'caso': r['caso'], 'repeticion': r['repeticion'],
                                          'falsos_positivos': r.get('falsos_positivos', [])} for r in rs]}
    return datos


def analizar_med9(rows, dimension, complemento=()):
    if not rows or any(r.get('dimension') != dimension for r in rows):
        raise ValueError('Seleccionar una sola dimensión de MED-9.')
    otra = 'deteccion' if dimension == 'ecologica' else 'ecologica'
    if any(r.get('dimension') != otra for r in complemento):
        raise ValueError('--complemento debe ser la otra dimensión de MED-9.')
    if len({bool(r.get('ensayo')) for r in [*rows, *complemento]}) != 1:
        raise ValueError('No mezclar ensayo y datos reales.')
    grupos = defaultdict(list)
    aux = defaultdict(list)
    for r in [*rows, *complemento]:
        if r.get('modelo') != 'openai/gpt-6.1-sol' or r.get('ejecutor') not in ('principal', 'charles'):
            raise ValueError('MED-9 requiere principal/Charles con gpt-6.1-sol.')
        if r.get('caso') not in (ECO if r['dimension'] == 'ecologica' else DET) or r.get('brazo') not in ('LB', 'indicado', 'disponible'):
            raise ValueError('Tarea o brazo ajeno a MED-9.')
        if r.get('condicion') != ('LB' if r['brazo'] == 'LB' else 'FIN'):
            raise ValueError('Condición incompatible con el brazo.')
        (grupos if r['dimension'] == dimension else aux)[(r['ejecutor'], r['modelo'])].append(r)
    salida = {}
    for key, rs in sorted(grupos.items()):
        g = grupo(rs, dimension)
        comp = grupo(aux[key], otra) if aux[key] else None
        eco, det = (g, comp) if dimension == 'ecologica' else (comp, g)
        mismo_k = {r.get('k') for r in rs} == {r.get('k') for r in aux[key]}
        g['criterio_ADR093_valido'] = bool(eco and det and eco['criterio_aplicable'] and det['criterio_aplicable'] and mismo_k) if comp else None
        if eco and det and eco['criterio_aplicable'] and det['criterio_aplicable'] and mismo_k:
            ind = det['indicadores']['LB']
            g['rama_respaldo'] = len(eco['tareas_permiso_con_problema_LB']) < 3 and ind['ID-1'] >= .9 and ind['falsos_positivos'] == 0
        g['complemento_valido'] = comp['criterio_aplicable'] if comp else None
        if not comp:
            g['pendiente'] = 'Rama de respaldo requiere --complemento con la otra línea de base completa de la misma combinación.'
        elif not mismo_k:
            g['pendiente'] = 'Las dimensiones complementarias tienen k distinto; no calcular la rama de respaldo.'
        salida['|'.join(key)] = g
    return dict(dimension=dimension, ensayo=bool(rows[0].get('ensayo')), grupos=salida,
                nota='ID-1: proporción de defectos detectados en al menos 2/3 de repeticiones; ID-2: falsos positivos por ejecución. Tokens secundarios: umbral 50 % provisorio (ADR-093).',
                ejecuciones=rows)


def markdown_med9(datos):
    lines = ['# Medición ecológica y detección' + (' · ENSAYO, datos inventados' if datos['ensayo'] else ''), '', datos['nota'], '']
    for key, g in datos['grupos'].items():
        lines += [f'## {key}', '', f"Dimensión válida: {g['valida']}; validez conjunta ADR-093: {g['criterio_ADR093_valido']}; rama de respaldo: {g['rama_respaldo']}.", '',
                  f"Motivos: {g['motivos_invalidez']}", '',
                  '| Brazo | Tarea | n | Éxito declarado falso | Con problema | Mediana tokens | Discrepancias | ID-2 |',
                  '|---|---|---:|---:|---|---:|---:|---:|']
        for b, ts in g['tareas'].items():
            for c, v in ts.items():
                lines.append(f"| {b} | {c} | {v['n']} | {v.get('proporcion_exito_declarado_falso', '')} | {v.get('con_problema', '')} | {v['mediana_tokens']} | {v['discrepancia_oraculo']} | {v.get('ID-2', '')} |")
        lines += ['', '| Brazo | Defecto | n | Detectado | ID-1 (≥ 2/3) | Con problema |', '|---|---|---:|---:|---|---|']
        for b, ds in g['defectos'].items():
            for d, v in ds.items():
                lines.append(f"| {b} | {d} | {v['n']} | {v['detectado']} | {v['ID_1']} | {v['con_problema']} |")
        lines += ['', g.get('pendiente', ''), '']
    return '\n'.join(lines) + '\n'
