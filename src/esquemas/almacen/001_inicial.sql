CREATE TABLE proyecto (
    id INTEGER PRIMARY KEY,
    ruta TEXT NOT NULL UNIQUE
);

CREATE TABLE resolucion (
    id INTEGER PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    instante TEXT NOT NULL,
    resumen_entradas TEXT NOT NULL CHECK (
        length(resumen_entradas) = 64
        AND length(CAST(resumen_entradas AS BLOB)) = 64
        AND resumen_entradas NOT GLOB '*[^0-9a-fA-F]*'
    ),
    herramienta TEXT NOT NULL,
    version_herramienta TEXT NOT NULL,
    version_rige TEXT NOT NULL,
    formato_documento INTEGER NOT NULL,
    documento TEXT NOT NULL CHECK (json_valid(documento))
);

CREATE INDEX resolucion_por_proyecto_instante ON resolucion(proyecto_id, instante);
CREATE INDEX resolucion_por_resumen ON resolucion(resumen_entradas);

CREATE TABLE entrada_leida (
    resolucion_id INTEGER NOT NULL REFERENCES resolucion(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    via TEXT NOT NULL CHECK(via <> ''),
    referencia TEXT NOT NULL,
    resumen TEXT,
    condicion TEXT NOT NULL CHECK (
        condicion IN ('observada', 'no_observada', 'definida', 'no_definida')
    ),
    PRIMARY KEY (resolucion_id, orden),
    CHECK (condicion = 'observada' OR resumen IS NULL)
);

CREATE TRIGGER resolucion_inmutable BEFORE UPDATE ON resolucion
BEGIN
    SELECT RAISE(ABORT, 'resolucion inmutable');
END;

CREATE TRIGGER entrada_leida_inmutable BEFORE UPDATE ON entrada_leida
BEGIN
    SELECT RAISE(ABORT, 'entrada_leida inmutable');
END;

PRAGMA user_version = 1;
