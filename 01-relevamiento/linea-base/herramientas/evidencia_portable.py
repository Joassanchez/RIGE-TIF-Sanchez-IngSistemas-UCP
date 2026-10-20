"""Exportación tar íntegra y lectura de enlaces sin privilegios en el anfitrión."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import posixpath
import shutil
import tarfile

SUFIJO = '.enlace.json'


def descriptor(path):
    return Path(str(path) + SUFIJO)


def relativa(nombre):
    p = PurePosixPath(nombre)
    if (p.is_absolute() or '..' in p.parts or '\\' in nombre or ':' in nombre or
            any(x.endswith((' ', '.')) for x in p.parts)):
        raise ValueError('Ruta de tar no portable: ' + nombre)
    return Path(*p.parts)


def dentro(path, raiz):
    path = Path(os.path.abspath(path))
    if not path.is_relative_to(raiz):
        raise ValueError('Enlace fuera de la evidencia: ' + str(path))
    return path


def sin_enlaces_locales(path, raiz):
    for p in (path, *path.parents):
        if p.is_symlink():
            raise ValueError('El destino contiene un enlace local: ' + str(p))
        if p == raiz:
            break


def extraer(archivo, destino, esperado):
    """No usa extract/extractall ni crea enlaces; valida antes de escribir."""
    archivo, destino = Path(archivo).resolve(), Path(destino).resolve()
    h = hashlib.sha256()
    with archivo.open('rb') as f:
        for bloque in iter(lambda: f.read(1024 * 1024), b''):
            h.update(bloque)
    digest = h.hexdigest()
    if digest != esperado:
        raise ValueError('SHA-256 del tar distinto del calculado en el contenedor')
    with tarfile.open(archivo, 'r:*') as tar:
        entradas, nombres = [], {}
        reservados = {archivo, Path(str(archivo) + '.sha256')}
        for m in tar:
            rel = relativa(m.name)
            if rel == Path('.') and m.isdir():
                continue
            if rel == Path('.') or not (m.isdir() or m.isfile() or m.issym() or m.islnk()):
                raise ValueError('Tipo de miembro tar no admitido: ' + m.name)
            original = dentro(destino / rel, destino)
            salida = descriptor(original) if m.issym() or m.islnk() else original
            if salida in reservados or original in reservados:
                raise ValueError('Miembro tar colisiona con el archivo íntegro')
            # Windows no distingue mayúsculas; reservar también el nombre virtual.
            for p in {original, salida}:
                k = str(p).casefold()
                if k in nombres:
                    raise ValueError('Miembros tar superpuestos: ' + m.name)
                nombres[k] = (m, p)
                sin_enlaces_locales(p, destino)
            entradas.append((m, original, salida))
        for m, original, salida in entradas:
            for padre in original.parents:
                if padre == destino:
                    break
                entrada = nombres.get(str(padre).casefold())
                if entrada and not entrada[0].isdir():
                    raise ValueError('Miembro tar bajo un enlace/archivo: ' + m.name)
        destino.mkdir(parents=True, exist_ok=True)
        for m, original, salida in entradas:
            salida.parent.mkdir(parents=True, exist_ok=True)
            if m.isdir():
                salida.mkdir(exist_ok=True)
            elif m.issym() or m.islnk():
                if original.exists():
                    if not original.is_file():
                        raise ValueError('El enlace reemplazaría un directorio: ' + m.name)
                    original.unlink()
                dato = dict(tipo='enlace' if m.issym() else 'enlace_duro', destino=m.linkname)
                if m.islnk():
                    dato['raiz'] = posixpath.relpath('.', str(PurePosixPath(m.name).parent))
                salida.write_text(json.dumps(dato, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            else:
                d = descriptor(original)
                if d.is_file():
                    d.unlink()
                with tar.extractfile(m) as fuente, salida.open('wb') as out:
                    shutil.copyfileobj(fuente, out)
    Path(str(archivo) + '.sha256').write_text(digest + '  ' + archivo.name + '\n', encoding='ascii')
    return digest


def resolver(path, raiz, virtuales=None):
    """Sigue enlaces nativos o sus descriptores, siempre dentro de la evidencia.

    virtuales reubica las raíces originales del desarrollador en snapshots
    global/proyecto: sus enlaces relativos conservan la profundidad original.
    """
    raiz = Path(raiz).resolve()
    path = dentro(path, raiz)
    vistos = set()
    for _ in range(64):
        if path in vistos:
            raise ValueError('Ciclo de enlaces en la evidencia')
        vistos.add(path)
        partes = path.relative_to(raiz).parts
        for i in range(1, len(partes) + 1):
            p = raiz.joinpath(*partes[:i])
            d = descriptor(p)
            if p.is_symlink():
                dato = dict(tipo='enlace', destino=os.readlink(p))
            elif d.is_file():
                dato = json.loads(d.read_text(encoding='utf-8'))
            else:
                continue
            if dato.get('tipo') not in ('enlace', 'enlace_duro') or not isinstance(dato.get('destino'), str):
                raise ValueError('Descriptor de enlace inválido: ' + str(d))
            destino = dato['destino']
            nuevo = None
            if dato['tipo'] == 'enlace_duro':
                nuevo = p.parent / dato['raiz'] / relativa(destino)
            elif virtuales:
                for virtual, real in virtuales.items():
                    if p.is_relative_to(real):
                        origen = PurePosixPath(virtual) / p.relative_to(real).as_posix()
                        absoluto = posixpath.normpath(posixpath.join(str(origen.parent), destino))
                        for v, r in virtuales.items():
                            if PurePosixPath(absoluto).is_relative_to(v):
                                nuevo = r / PurePosixPath(absoluto).relative_to(v)
                                break
                        break
            if nuevo is None:
                nuevo = p.parent / destino
            path = dentro(nuevo.joinpath(*partes[i:]), raiz)
            break
        else:
            return path
    raise ValueError('Cadena de enlaces demasiado larga')


def leer_texto(path, raiz, virtuales=None):
    return resolver(path, raiz, virtuales).read_text(encoding='utf-8')


def leer_json(path, raiz):
    return json.loads(leer_texto(path, raiz))


def archivos(carpeta, patron):
    """Enumera los nombres originales, sin confundir descriptores con capturas."""
    carpeta = Path(carpeta)
    paths = {p for p in carpeta.glob(patron) if not p.name.endswith(SUFIJO)}
    paths.update(Path(str(p)[:-len(SUFIJO)]) for p in carpeta.glob('*' + SUFIJO)
                 if PurePosixPath(p.name[:-len(SUFIJO)]).match(patron))
    return sorted(paths)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('archivo', type=Path)
    p.add_argument('--destino', required=True, type=Path)
    p.add_argument('--sha256', required=True)
    a = p.parse_args()
    try:
        extraer(a.archivo, a.destino, a.sha256)
    except (OSError, ValueError, tarfile.TarError) as e:
        p.error(str(e))


if __name__ == '__main__':
    main()
