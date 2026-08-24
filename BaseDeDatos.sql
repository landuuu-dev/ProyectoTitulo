
CREATE EXTENSION IF NOT EXISTS postgis;
 
 
-- 1. TABLA ROLES

CREATE TABLE roles (
    id_rol       SERIAL PRIMARY KEY,
    nombre_rol   VARCHAR(20) NOT NULL UNIQUE
);
 
 
-- 2. TABLA USUARIOS
CREATE TABLE usuarios (
    id_usuario      SERIAL PRIMARY KEY,
    nombre          VARCHAR(30) NOT NULL,
    email           VARCHAR(40) NOT NULL UNIQUE,
    password        VARCHAR(60) NOT NULL,          -- hash (bcrypt)
    id_rol          INT NOT NULL,
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW(),
 
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);
 
 
-- 3. TABLA SITIOS_PATRIMONIALES
CREATE TABLE sitios_patrimoniales (
    id_sitio        SERIAL PRIMARY KEY,
    titulo_es       VARCHAR(60) NOT NULL,
    titulo_en       VARCHAR(60) NOT NULL,
    descripcion_es  TEXT NOT NULL,
    descripcion_en  TEXT NOT NULL,
 
    -- Campo geoespacial PostGIS: reemplaza latitud/longitud sueltos.
    -- SRID 4326 = sistema de referencia WGS 84, el mismo que usa el GPS.
    ubicacion       GEOGRAPHY(Point, 4326) NOT NULL,
 
    imagen_url      VARCHAR(150),
    audioguia_url   VARCHAR(150),
    id_creador      INT NOT NULL,
 
    CONSTRAINT fk_sitios_creador
        FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario)
);
 
-- Índice espacial GiST: acelera drásticamente las consultas de
-- proximidad (geofencing) sobre la columna 'ubicacion'.
CREATE INDEX idx_sitios_ubicacion
    ON sitios_patrimoniales USING GIST (ubicacion);
 
 
-- 4. TABLA CATEGORIAS
CREATE TABLE categorias (
    id_categoria      SERIAL PRIMARY KEY,
    nombre_categoria  VARCHAR(30) NOT NULL UNIQUE
);
 
 
-- 5. TABLA EVENTOS_CULTURALES
CREATE TABLE eventos_culturales (
    id_evento           SERIAL PRIMARY KEY,
    titulo               VARCHAR(60) NOT NULL,
    descripcion           TEXT NOT NULL,
    lugar                 VARCHAR(60) NOT NULL,
    fecha_inicio          TIMESTAMP NOT NULL,
    estado_moderacion     VARCHAR(15) NOT NULL DEFAULT 'Pendiente',
    fuente_origen         VARCHAR(20) NOT NULL DEFAULT 'Manual',
    id_categoria          INT NOT NULL,
 
    CONSTRAINT fk_eventos_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
 
    CONSTRAINT chk_estado_moderacion
        CHECK (estado_moderacion IN ('Pendiente', 'Aprobado', 'Rechazado')),
 
    CONSTRAINT chk_fuente_origen
        CHECK (fuente_origen IN ('Manual', 'Scraper_SERNATUR', 'Scraper_Muni'))
);
 
 
-- 6. TABLA FAVORITOS 
CREATE TABLE favoritos (
    id_favorito     SERIAL PRIMARY KEY,
    id_usuario      INT NOT NULL,
    id_sitio        INT,      
    id_evento       INT,      
    fecha_guardado  TIMESTAMP NOT NULL DEFAULT NOW(),
 
    CONSTRAINT fk_favoritos_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
 
    CONSTRAINT fk_favoritos_sitio
        FOREIGN KEY (id_sitio) REFERENCES sitios_patrimoniales(id_sitio),
 
    CONSTRAINT fk_favoritos_evento
        FOREIGN KEY (id_evento) REFERENCES eventos_culturales(id_evento),
 

    CONSTRAINT chk_favorito_xor
        CHECK (
            (id_sitio IS NOT NULL AND id_evento IS NULL)
            OR
            (id_sitio IS NULL AND id_evento IS NOT NULL)
        )
);
