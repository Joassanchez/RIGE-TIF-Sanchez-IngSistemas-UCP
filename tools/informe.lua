-- Filtro de armado del informe (pandoc → docx)
-- 1. Carátula de capítulo: "# III · TÍTULO" → hoja aparte con numeral y título centrados;
--    el texto empieza en la hoja siguiente, sin repetir el título.
-- 2. Otros títulos de nivel 1 (RESUMEN, BIBLIOGRAFÍA, ANEXO…) empiezan en hoja nueva.
-- 3. Listas del cuerpo en estilo de cuerpo (las celdas de tabla usan Compact: Calibri 9,5).
-- 4. Leyendas «Tabla N. …» / «Figura N. …» en estilo Caption.

local SALTO = pandoc.RawBlock('openxml', '<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
local primero = true
-- Espaciador de altura exacta: Word y LibreOffice suprimen el espacio anterior al inicio de página.
local ESPACIO = pandoc.RawBlock('openxml', '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="4800" w:lineRule="exact"/></w:pPr></w:p>')

local function estilo(nombre, bloques)
  return pandoc.Div(bloques, pandoc.Attr('', {}, {{'custom-style', nombre}}))
end

function Header(h)
  if h.level ~= 1 then return nil end
  local texto = pandoc.utils.stringify(h.content)
  local salto = primero and {} or {SALTO}
  primero = false
  local num, titulo = texto:match('^([IVXL]+) · (.+)$')
  if num then
    local r = salto
    table.insert(r, ESPACIO)
    table.insert(r, estilo('Carátula Numeral', {pandoc.Para({pandoc.Str(num)})}))
    table.insert(r, estilo('Carátula Título', {pandoc.Para({pandoc.Str(titulo)})}))
    table.insert(r, SALTO)
    return r
  end
  table.insert(salto, h)
  return salto
end

local function soltar(lista)
  for i, item in ipairs(lista.content) do
    for j, b in ipairs(item) do
      if b.t == 'Plain' then item[j] = pandoc.Para(b.content) end
    end
  end
  return lista
end
BulletList = soltar
OrderedList = soltar

function Para(p)
  if #p.content == 1 and p.content[1].t == 'Emph' then
    local t = pandoc.utils.stringify(p.content[1])
    if t:match('^Tabla ') or t:match('^Figura ') or t:match('^Tabla A%.') then
      return estilo('Caption', {p})
    end
  end
end

-- Los estilos de tabla (celdas) no deben verse afectados por soltar listas dentro de celdas
function Table(t)
  -- Tablas con anchos explícitos (grid): se normalizan al ancho del texto.
  local suma = 0
  for _, cs in ipairs(t.colspecs) do
    if type(cs[2]) == 'number' then suma = suma + cs[2] end
  end
  if suma > 0 then
    local MIN, total = 0.17, 0
    for i, cs in ipairs(t.colspecs) do
      if type(cs[2]) == 'number' then
        local w = math.max(cs[2] / suma, MIN)
        t.colspecs[i] = {cs[1], w}; total = total + w
      end
    end
    for i, cs in ipairs(t.colspecs) do
      if type(cs[2]) == 'number' then t.colspecs[i] = {cs[1], cs[2] / total} end
    end
  end
  return pandoc.walk_block(t, { Para = function(p) return pandoc.Plain(p.content) end })
end
