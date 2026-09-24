-- Migración: quita los anchos de columna para que pandoc escriba tablas pipe
-- cuando las celdas no tienen contenido de bloque (más legibles y editables).
function Table(t)
  for i, cs in ipairs(t.colspecs) do t.colspecs[i] = {cs[1], pandoc.ColWidthDefault} end
  return t
end
