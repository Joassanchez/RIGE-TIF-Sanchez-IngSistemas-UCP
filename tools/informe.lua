-- Filtro de armado del informe (pandoc → docx)
-- 1. Carátula de capítulo: "# III · TÍTULO" → hoja aparte con numeral y título centrados;
--    el texto empieza en la hoja siguiente, sin repetir el título.
-- 2. Otros títulos de nivel 1 (RESUMEN, BIBLIOGRAFÍA, ANEXO…) empiezan en hoja nueva.
-- 3. Listas del cuerpo en estilo de cuerpo (las celdas de tabla usan Compact: Times New Roman 10).
-- 4. Leyendas «Tabla N. …» / «Figura N. …» en estilo Caption.
-- 5. Figuras sin la leyenda automática de pandoc (la leyenda es el párrafo «Figura N. …») y
--    nunca más anchas que el texto.

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

-- Peso de cada columna según su contenido: largo medio de las celdas, atenuado para que una
-- columna de texto largo no deje sin ancho a las cortas, y sin bajar de la palabra más larga
-- (para que no se corte). Se usa en las tablas sin anchos explícitos.
local CARACTERES = 75  -- caracteres de Times New Roman 10 (negrita en el encabezado) en el ancho del texto, con el relleno de celda
local function pesos(t)
  local filas = {}
  for _, r in ipairs(t.head.rows) do table.insert(filas, r) end
  for _, b in ipairs(t.bodies) do
    for _, r in ipairs(b.body) do table.insert(filas, r) end
  end
  local tot, cant, palabra = {}, {}, {}
  for _, r in ipairs(filas) do
    local col = 1
    for _, c in ipairs(r.cells) do
      local s = pandoc.utils.stringify(c.contents)
      local n = utf8.len(s) or #s
      tot[col] = (tot[col] or 0) + n; cant[col] = (cant[col] or 0) + 1
      for w in s:gmatch('%S+') do palabra[col] = math.max(palabra[col] or 0, utf8.len(w) or #w) end
      col = col + (c.col_span or 1)
    end
  end
  local p, minimo = {}, {}
  for i = 1, #t.colspecs do
    local media = (tot[i] or 0) / math.max(cant[i] or 1, 1)
    p[i] = math.max(media, 1) ^ 0.7
    minimo[i] = ((palabra[i] or 0) + 2) / CARACTERES
  end
  return p, minimo
end

-- Los estilos de tabla (celdas) no deben verse afectados por soltar listas dentro de celdas
function Table(t)
  -- Toda tabla lleva anchos relativos que suman 1 (armar.py los lleva al ancho del texto).
  local suma = 0
  for _, cs in ipairs(t.colspecs) do
    if type(cs[2]) == 'number' then suma = suma + cs[2] end
  end
  if suma == 0 then
    -- Reparto proporcional; la columna que no alcanza su mínimo queda fija en él y el resto
    -- del ancho se vuelve a repartir entre las demás.
    local p, minimo = pesos(t)
    local n, w, fija = #t.colspecs, {}, {}
    local MIN = 0.5 / n
    for i = 1, n do minimo[i] = math.max(minimo[i], MIN) end
    repeat
      local libre, peso = 1, 0
      for i = 1, n do
        if fija[i] then libre = libre - w[i] else peso = peso + p[i] end
      end
      local cambio = false
      for i = 1, n do
        if not fija[i] then
          w[i] = libre * p[i] / peso
          if w[i] < minimo[i] then w[i] = minimo[i]; fija[i] = true; cambio = true end
        end
      end
    until not cambio
    local total = 0
    for i = 1, n do total = total + w[i] end
    for i, cs in ipairs(t.colspecs) do t.colspecs[i] = {cs[1], w[i] / total} end
  elseif suma > 0 then
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

-- El texto alternativo de la imagen queda como descripción, no como segunda leyenda.
function Figure(f)
  local img
  pandoc.walk_block(f, { Image = function(i) img = img or i end })
  if img then return pandoc.Para({img}) end
end

local ANCHO_CM = 15  -- ancho del texto: A4 menos márgenes de 3 cm
function Image(i)
  local v, u = (i.attributes.width or ''):match('^([%d.]+)(%a*)$')
  local cm = v and ((u == 'in' and v * 2.54) or (u == 'cm' and tonumber(v)) or (u == 'mm' and v / 10))
  if cm and cm > ANCHO_CM then
    i.attributes.width = ANCHO_CM .. 'cm'; i.attributes.height = nil
  end
  return i
end
