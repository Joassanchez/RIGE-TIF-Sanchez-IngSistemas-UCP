"""Recálculo auditable del acceso web, según ADR-086, punto 5."""
import re


def acceso_web(herramientas):
    return int(any(
        t['herramienta'] in ('webfetch', 'websearch') or bool(re.search(
            r'\b(?:curl|wget|fetch|requests|urllib|Invoke-WebRequest)\b|https?://',
            t['argumentos'].get('command', '').replace('https://opencode.ai/config.json', ''),
            re.I))
        for t in herramientas))


def recalcular_acceso_web(row):
    """Conserva la marca registrada; sin herramientas no infiere otra marca."""
    registrado = row.get('acceso_web', 0)
    return dict(acceso_web_registrado=registrado, regla_acceso_web='ADR-086',
                acceso_web=acceso_web(row['herramientas']) if 'herramientas' in row else registrado)
