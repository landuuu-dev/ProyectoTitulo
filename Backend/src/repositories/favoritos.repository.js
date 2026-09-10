import { pool } from "../db.js";

export const FavoritosRepository = {
  // Retorna tanto sitios como eventos en un solo objeto
  async getFavoritosByUsuario(id_usuario) {
    const sitios = await this.getFavoritosSitiosByUsuario(id_usuario);
    const eventos = await this.getFavoritosEventosByUsuario(id_usuario);

    return {
      sitios,
      eventos,
    };
  },

  // 1. Obtener sitios favoritos del usuario
  async getFavoritosSitiosByUsuario(id_usuario) {
    const result = await pool.query(
      `SELECT f.id_favorito, f.fecha_guardado, s.id_sitio, s.titulo_es, s.imagen_url,
              ST_X(s.ubicacion::geometry) AS longitud, 
              ST_Y(s.ubicacion::geometry) AS latitud
       FROM favoritos f
       JOIN sitios_patrimoniales s ON f.id_sitio = s.id_sitio
       WHERE f.id_usuario = $1
       ORDER BY f.fecha_guardado DESC`,
      [id_usuario],
    );
    return result.rows;
  },

  // 2. Obtener eventos favoritos del usuario
  async getFavoritosEventosByUsuario(id_usuario) {
    const result = await pool.query(
      `SELECT f.id_favorito, f.fecha_guardado, e.id_evento, e.titulo, e.descripcion, e.lugar, e.fecha_inicio
       FROM favoritos f
       JOIN eventos_culturales e ON f.id_evento = e.id_evento
       WHERE f.id_usuario = $1
       ORDER BY f.fecha_guardado DESC`,
      [id_usuario],
    );
    return result.rows;
  },

  // 3. Agregar un sitio a favoritos
  async addFavoritoSitio(id_usuario, id_sitio) {
    const result = await pool.query(
      `INSERT INTO favoritos (id_usuario, id_sitio)
       SELECT $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM favoritos WHERE id_usuario = $1 AND id_sitio = $2
       )
       RETURNING *`,
      [id_usuario, id_sitio],
    );
    return result.rows[0] || null;
  },

  // 4. Agregar un evento a favoritos
  async addFavoritoEvento(id_usuario, id_evento) {
    const result = await pool.query(
      `INSERT INTO favoritos (id_usuario, id_evento)
       SELECT $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM favoritos WHERE id_usuario = $1 AND id_evento = $2
       )
       RETURNING *`,
      [id_usuario, id_evento],
    );
    return result.rows[0] || null;
  },
  // 5. Eliminar un sitio de favoritos
  async removeFavoritoSitio(id_usuario, id_sitio) {
    const result = await pool.query(
      `DELETE FROM favoritos 
       WHERE id_usuario = $1 AND id_sitio = $2 
       RETURNING id_favorito`,
      [id_usuario, id_sitio],
    );
    return result.rows[0] || null;
  },

  // 6. Eliminar un evento de favoritos
  async removeFavoritoEvento(id_usuario, id_evento) {
    const result = await pool.query(
      `DELETE FROM favoritos 
       WHERE id_usuario = $1 AND id_evento = $2 
       RETURNING id_favorito`,
      [id_usuario, id_evento],
    );
    return result.rows[0] || null;
  },
};
