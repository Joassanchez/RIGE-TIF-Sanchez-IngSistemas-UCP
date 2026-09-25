# Preparación de la VM de la línea base

Esta carpeta contiene todo lo que va a la máquina virtual y nada más. No contiene respuestas: las respuestas están en `sesion/`, que nunca entra a la VM.

| Archivo | Qué es |
|---|---|
| `instalar.sh` | Instala OpenCode 1.18.25, congela la versión y deja todo en su lugar |
| `caso.sh` | Activa un caso para el participante |
| `verificar.sh` | Captura la evidencia de los casos para el anexo |
| `casos/` | Los dieciséis escenarios, el de práctica y el proyecto común |
| `docs/` | Documentación oficial de la 1.18.25 en HTML, sin conexión (36 páginas, commit `cb7d8b2f5e44`) |
| `hoja-referencia.md` | La hoja única que tiene el participante durante la sesión |

## Una vez: preparar la VM

1. **Instalar Ubuntu** (x86_64). El usuario que crea el instalador es el tuyo, con permisos de administrador.
2. **Crear el usuario del participante, sin sudo:**
   ```bash
   sudo adduser participante
   ```
   El participante nunca conoce tu contraseña. Es lo que impide que lea `/opt/linea-base`.
3. **Copiar esta carpeta a la VM** e instalar, **con red**:
   ```bash
   sudo ./instalar.sh
   ```
4. **Borrar la carpeta copiada.** Contiene las plantillas de los casos. `verificar.sh` avisa si queda alguna copia.
5. **Cortar la red** de la VM.
6. **Verificar:**
   ```bash
   sudo /opt/linea-base/verificar.sh
   ```
   Revisar cada archivo generado en `/opt/linea-base/verificacion/<fecha>/` contra `sesion/casos-y-respuestas.md`. Copiar esa carpeta fuera de la VM: es la evidencia del anexo.
7. **Dejar la VM en el estado inicial y sacar la instantánea:**
   ```bash
   sudo /opt/linea-base/caso.sh practica
   ```

## Cada participante

1. Restaurar la instantánea.
2. Iniciar sesión como `participante`.

## Entre casos (fuera del cronómetro)

Desde una terminal, con un **espacio al principio** para que el comando no quede en el historial del participante:

```bash
 su - <tu-usuario> -c "sudo /opt/linea-base/caso.sh C-2a"
```

Después **cerrar todas las terminales** y abrir una nueva en el directorio que indica el script. Hay que abrirla de nuevo siempre: es lo que carga las variables de entorno del caso (C-3a) y el directorio de trabajo (C-2b empieza en `~/proyecto/sub`).

## Qué deja cada caso

| Ubicación | Contenido |
|---|---|
| `~/.config/opencode/` | Sólo la configuración global del caso, o vacío |
| `~/proyecto/` | El proyecto común más los archivos del caso, con un repositorio git y un commit inicial |
| `~/.bashrc` | Las variables de entorno del caso, si las tiene, en un bloque que se borra al cambiar de caso |

La ruta del proyecto es siempre la misma: nada en lo que ve el participante identifica qué caso es.
