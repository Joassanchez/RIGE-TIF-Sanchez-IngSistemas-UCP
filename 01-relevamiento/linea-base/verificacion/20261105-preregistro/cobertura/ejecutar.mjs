// Corre RIGE sobre cada forma del plan, dentro de la imagen de RIGE, sin red ni agentes.
// Uso: bun ejecutar.mjs <plan.json> <salida.json> <raíz de src>
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const [planRuta, salida, raiz] = process.argv.slice(2)
const { plan, comun } = JSON.parse(readFileSync(planRuta, 'utf8'))
const HOME = '/home/participante'
const PROYECTO = `${HOME}/proyecto`
const destino = (k) => (k.startsWith('G/') ? `${HOME}/.config/opencode/${k.slice(2)}` : k.startsWith('P/') ? `${PROYECTO}/${k.slice(2)}` : `${HOME}/${k.slice(2)}`)

function escribir(ruta, contenido) {
  mkdirSync(dirname(ruta), { recursive: true })
  if (existsSync(ruta)) rmSync(ruta, { force: true })
  if (contenido && contenido.enlace) symlinkSync(contenido.enlace, ruta)
  else if (contenido && contenido.archivo_regular !== undefined) writeFileSync(ruta, contenido.archivo_regular)
  else writeFileSync(ruta, contenido)
}
function preparar(p) {
  rmSync(HOME, { recursive: true, force: true })
  mkdirSync(`${HOME}/.config/opencode`, { recursive: true })
  for (const [k, v] of Object.entries(comun)) escribir(join(PROYECTO, k), Buffer.from(v, 'base64'))
  for (const [k, v] of Object.entries(p.archivos)) escribir(destino(k), v)
  for (const s of p.sondas) {
    if (['read', 'edit', 'write'].includes(s.herramienta) && !s.objetivo.includes('*')) {
      const f = join(PROYECTO, p.directorio && s.herramienta === 'write' ? p.directorio : '', s.objetivo)
      if (!existsSync(f)) escribir(f, 'MED9_ARCHIVO_LOCAL\n')
    }
  }
  for (const a of [['init', '-q'], ['add', '-A'], ['-c', 'user.name=m', '-c', 'user.email=m@l', 'commit', '-qm', 'e']]) spawnSync('git', a, { cwd: PROYECTO })
}
function rige(p, args) {
  const env = { PATH: process.env.PATH, HOME, XDG_CONFIG_HOME: `${HOME}/.config`, XDG_DATA_HOME: `${HOME}/.local/share`, RIGE_ALMACEN: '/tmp/rige-almacen' }
  for (const [k, v] of Object.entries(p.env)) if (v !== null) env[k] = v
  const r = spawnSync(process.execPath, ['paquetes/rige/arranque/rige.ts', ...args], { cwd: raiz, env, encoding: 'utf8', maxBuffer: 1 << 28 })
  try { return JSON.parse(r.stdout) } catch { return { error: { codigo: 'salida-invalida', mensaje: (r.stderr || r.stdout || '').slice(0, 300) } } }
}
const salidaFilas = []
for (const p of plan) {
  preparar(p)
  const dir = p.directorio ? `${PROYECTO}/${p.directorio}` : PROYECTO
  const fila = { caso: p.caso, variante: p.variante, estrato: p.estrato, sondas: [] }
  for (const s of p.sondas) {
    const una = (objetivo) => {
      const o = rige(p, ['permiso', '--proyecto', dir, '--agente', s.agente, '--herramienta', s.herramienta, '--objetivo', objetivo])
      return o.error ? { error: o.error.codigo, mensaje: o.error.mensaje } : { decision: o.decision, motivo: o.motivoSinDecision ?? null }
    }
    const rel = una(s.objetivo)
    const abs = ['read', 'edit', 'write'].includes(s.herramienta) ? una(join(PROYECTO, s.objetivo)) : null
    fila.sondas.push({ ...s, relativa: rel, absoluta: abs })
  }
  const h = rige(p, ['hallazgos', '--proyecto', dir])
  fila.hallazgos = h.error ? { error: h.error.codigo } : (h.hallazgos ?? []).map((x) => ({ tipo: x.tipo, causa: x.causa }))
  if (Array.isArray(p.valor) && !String(p.valor[0]).startsWith('__')) {
    const v = rige(p, ['valores', '--proyecto', dir, '--agente', p.valor[0], '--clave', p.valor[1]])
    fila.valor = { pedido: p.valor, salida: v.error ? { error: v.error.codigo, mensaje: v.error.mensaje } : JSON.stringify(v.claves ?? v.valores ?? v).slice(0, 4000) }
  }
  salidaFilas.push(fila)
  console.log(p.caso, p.variante)
}
writeFileSync(salida, JSON.stringify(salidaFilas))
