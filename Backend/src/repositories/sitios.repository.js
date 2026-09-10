import { pool } from "../db.js";

export const SitiosRepository = {
  // 1. Listar todos los sitios
  async getSitios() {
    const result = await pool.query(`
      SELECT 
        s.id_sitio,
        s.titulo_es,
        s.titulo_en,
        s.descripcion_es,
        s.descripcion_en,
        ST_AsGeoJSON(s.ubicacion)::json AS ubicacion,
        s.imagen_url,
        s.audioguia_url,
        s.id_creador,
        u.nombre AS nombre_creador
      FROM sitios_patrimoniales s
      JOIN usuarios u ON s.id_creador = u.id_usuario
    `);
    return result.rows;
  },

  // 2. Buscar sitio por ID
  async findByIdSitios(id) {
    const result = await pool.query(
      `SELECT 
        s.id_sitio,
        s.titulo_es,
        s.titulo_en,
        s.descripcion_es,
        s.descripcion_en,
        ST_AsGeoJSON(s.ubicacion)::json AS ubicacion,
        s.imagen_url,
        s.audioguia_url,
        s.id_creador,
        u.nombre AS nombre_creador
      FROM sitios_patrimoniales s
      JOIN usuarios u ON s.id_creador = u.id_usuario
      WHERE s.id_sitio = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  // 3. Crear sitio (convirtiendo latitud y longitud a PostGIS Geography)
  async create({
    titulo_es,
    titulo_en,
    descripcion_es,
    descripcion_en,
    longitud,
    latitud,
    imagen_url,
    audioguia_url,
    id_creador,
  }) {
    const result = await pool.query(
      `INSERT INTO sitios_patrimoniales (
        titulo_es, 
        titulo_en, 
        descripcion_es, 
        descripcion_en, 
        ubicacion, 
        imagen_url, 
        audioguia_url, 
        id_creador
      ) 
      VALUES (
        $1, $2, $3, $4, 
        ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, 
        $7, $8, $9
      ) 
      RETURNING id_sitio, titulo_es, titulo_en, id_creador`,
      [
        titulo_es,
        titulo_en,
        descripcion_es,
        descripcion_en,
        longitud,
        latitud,
        imagen_url,
        audioguia_url,
        id_creador,
      ],
    );
    return result.rows[0];
  },

  // 4. Actualizar sitio por ID
  async update(
    id,
    {
      titulo_es,
      titulo_en,
      descripcion_es,
      descripcion_en,
      longitud,
      latitud,
      imagen_url,
      audioguia_url,
    },
  ) {
    const result = await pool.query(
      `UPDATE sitios_patrimoniales 
       SET 
         titulo_es = $1,
         titulo_en = $2,
         descripcion_es = $3,
         descripcion_en = $4,
         ubicacion = ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography,
         imagen_url = $7,
         audioguia_url = $8
       WHERE id_sitio = $9
       RETURNING id_sitio, titulo_es, titulo_en`,
      [
        titulo_es,
        titulo_en,
        descripcion_es,
        descripcion_en,
        longitud,
        latitud,
        imagen_url,
        audioguia_url,
        id,
      ],
    );
    return result.rows[0] || null;
  },

  // 5. Eliminar sitio por ID
  async deleteSitio(id) {
    const result = await pool.query(
      `DELETE FROM sitios_patrimoniales 
       WHERE id_sitio = $1 
       RETURNING id_sitio`,
      [id],
    );
    return result.rows[0] || null;
  },

  async getCercanos(lat, lng, radioMetros = 5000) {
    const result = await pool.query(
      `SELECT 
        id_sitio,
        titulo_es,
        descripcion_es,
        imagen_url,
        ST_X(ubicacion::geometry) AS longitud,
        ST_Y(ubicacion::geometry) AS latitud,
        ROUND(ST_Distance(ubicacion, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)) AS distancia_metros
     FROM sitios_patrimoniales
     WHERE ST_DWithin(
        ubicacion,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
     )
     ORDER BY distancia_metros ASC`,
      [lng, lat, radioMetros],
    );
    return result.rows;
  },
};
