const productos = require('./productos');

function buscar(codigo) {
  return productos.find((p) => p.codigo === codigo) ?? null;
}

module.exports = { buscar };
