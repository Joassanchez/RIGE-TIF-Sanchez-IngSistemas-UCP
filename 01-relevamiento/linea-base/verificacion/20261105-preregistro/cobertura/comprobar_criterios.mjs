// Comprueba criterios que el contraste de decisiones no acredita: RF-09 (advertencia) y RF-06 (origen nativo).
// Uso, dentro de un contenedor sin red: bun comprobar_criterios.mjs <plan.json> <salida.json> <raíz de src>
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const [planRuta, salida, raiz] = process.argv.slice(2)
const { plan, comun } = JSON.parse(readFileSync(planRuta, 'utf8'))
const HOME = '/home/participante'
const PROYECTO = `${HOME}/proyecto`
const destino = (k) => (k.startsWith('G/') ? `${HOME}/.config/opencode/${k.slice(2)}` : k.startsWith('P/') ? `${PROYECTO}/${k.slice(2)}` : `${HOME}/${k.slice(2)}`)
const CONSULTAS = [
  ['N-5', 'ingenua_global', 'plan', 'edit', 'src/index.js'],
  ['N-5', 'correcta', 'plan', 'edit', 'src/index.js'],
  ['N-12', 'base', 'build', 'read', '.env'],
  ['N-21', 'base', 'build', 'read', '.env'],
  ['N-21', 'correcta', 'build', 'read', '.env'],
]
function escribir(ruta, contenido) {
  mkdirSync(dirname(ruta), { recursive: true })
  if (existsSync(ruta)) rmSync(ruta, { force: true })
  if (contenido && contenido.enlace) symlinkSync(contenido.enlace, ruta)
  else if (contenido && contenido.archivo_regular !== undefined) writeFileSync(ruta, contenido.archivo_regular)
  else writeFileSync(ruta, contenido)
}
const filas = []
for (const [caso, variante, agente, herramienta, objetivo] of CONSULTAS) {
  const p = plan.find((x) => x.caso === caso && x.variante === variante)
  rmSync(HOME, { recursive: true, force: true })
  mkdirSync(`${HOME}/.config/opencode`, { recursive: true })
  for (const [k, v] of Object.entries(comun)) escribir(join(PROYECTO, k), Buffer.from(v, 'base64'))
  for (const [k, v] of Object.entries(p.archivos)) escribir(destino(k), v)
  const f = join(PROYECTO, objetivo)
  if (!existsSync(f)) escribir(f, 'MED9_ARCHIVO_LOCAL\n')
  for (const a of [['init', '-q'], ['add', '-A'], ['-c', 'user.name=m', '-c', 'user.email=m@l', 'commit', '-qm', 'e']]) spawnSync('git', a, { cwd: PROYECTO })
  const env = { PATH: process.env.PATH, HOME, XDG_CONFIG_HOME: `${HOME}/.config`, XDG_DATA_HOME: `${HOME}/.local/share`, RIGE_ALMACEN: '/tmp/rige-almacen' }
  const r = spawnSync(process.execPath, ['paquetes/rige/arranque/rige.ts', 'permiso', '--proyecto', PROYECTO, '--agente', agente, '--herramienta', herramienta, '--objetivo', objetivo], { cwd: raiz, env, encoding: 'utf8', maxBuffer: 1 << 28 })
  const o = JSON.parse(r.stdout)
  const nativa = p.sondas.find((s) => s.agente === agente && s.herramienta === herramienta && s.objetivo === objetivo)?.nativa ?? null
  filas.push({ caso, variante, agente, herramienta, objetivo, decision: o.decision, nativa,
    determinante: o.cadena?.find((x) => x.indice === o.determinante)?.origen?.tipo ?? null,
    origenes: [...new Set((o.cadena ?? []).map((x) => x.origen?.tipo))],
    advertencias: o.advertencias ?? null, codigos: o.declaraciones ?? null,
    stderr: r.stderr.split('\n').filter((l) => l.includes('advertencia')).map((l) => JSON.parse(l).advertencia?.codigo) })
}
writeFileSync(salida, JSON.stringify(filas, null, 1))
console.log(JSON.stringify(filas, null, 1))
