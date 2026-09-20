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
        ST_AsGeoJSON(s.ubicacion) AS ubicacion,
        ST_X(s.ubicacion::geometry) AS longitud,
        ST_Y(s.ubicacion::geometry) AS latitud,
        s.imagen_url,
        s.audioguia_es_url,
        s.audioguia_en_url,
        s.id_creador,
        COALESCE(u.nombre, 'Sin Creador') AS nombre_creador
      FROM sitios_patrimoniales s
      LEFT JOIN usuarios u ON s.id_creador = u.id_usuario
    `);

    return result.rows.map((row) => ({
      ...row,
      ubicacion: row.ubicacion ? JSON.parse(row.ubicacion) : null,
    }));
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
        ST_AsGeoJSON(s.ubicacion) AS ubicacion,
        ST_X(s.ubicacion::geometry) AS longitud,
        ST_Y(s.ubicacion::geometry) AS latitud,
        s.imagen_url,
        s.audioguia_es_url,
        s.audioguia_en_url,
        s.id_creador,
        COALESCE(u.nombre, 'Sin Creador') AS nombre_creador
      FROM sitios_patrimoniales s
      LEFT JOIN usuarios u ON s.id_creador = u.id_usuario
      WHERE s.id_sitio = $1`,
      [id],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return {
      ...row,
      ubicacion: row.ubicacion ? JSON.parse(row.ubicacion) : null,
    };
  },

  // 3. Crear sitio
  async create({
    titulo_es,
    titulo_en,
    descripcion_es,
    descripcion_en,
    longitud,
    latitud,
    imagen_url,
    audioguia_es_url,
    audioguia_en_url,
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
        audioguia_es_url,
        audioguia_en_url,
        id_creador
      ) 
      VALUES (
        $1, $2, $3, $4, 
        ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, 
        $7, $8, $9, $10
      ) 
      RETURNING 
        id_sitio,
        titulo_es,
        titulo_en,
        id_creador,
        audioguia_es_url,
        audioguia_en_url`,
      [
        titulo_es,
        titulo_en,
        descripcion_es,
        descripcion_en,
        longitud,
        latitud,
        imagen_url,
        audioguia_es_url,
        audioguia_en_url,
        id_creador,
      ],
    );

    return result.rows[0];
  },

  // 4. Actualizar sitio
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
      audioguia_es_url,
      audioguia_en_url,
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
         audioguia_es_url = $8,
         audioguia_en_url = $9
       WHERE id_sitio = $10

       RETURNING 
         id_sitio,
         titulo_es,
         titulo_en,
         audioguia_es_url,
         audioguia_en_url`,
      [
        titulo_es,
        titulo_en,
        descripcion_es,
        descripcion_en,
        longitud,
        latitud,
        imagen_url,
        audioguia_es_url,
        audioguia_en_url,
        id,
      ],
    );

    return result.rows[0] || null;
  },

  // 5. Eliminar sitio
  async deleteSitio(id) {
    const result = await pool.query(
      `DELETE FROM sitios_patrimoniales 
       WHERE id_sitio = $1 
       RETURNING id_sitio`,
      [id],
    );

    return result.rows[0] || null;
  },

  // 6. Obtener sitios cercanos
  async getCercanos(lat, lng, radioMetros = 5000) {
    const result = await pool.query(
      `SELECT 
        id_sitio,
        titulo_es,
        descripcion_es,
        imagen_url,
        ST_X(ubicacion::geometry) AS longitud,
        ST_Y(ubicacion::geometry) AS latitud,
        ROUND(
          ST_Distance(
            ubicacion,
            ST_SetSRID(
              ST_MakePoint($1, $2),
              4326
            )::geography
          )
        ) AS distancia_metros
      FROM sitios_patrimoniales
      WHERE ST_DWithin(
        ubicacion,
        ST_SetSRID(
          ST_MakePoint($1, $2),
          4326
        )::geography,
        $3
      )
      ORDER BY distancia_metros ASC`,
      [lng, lat, radioMetros],
    );

    return result.rows;
  },
};
