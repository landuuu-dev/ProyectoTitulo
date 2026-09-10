import { pool } from "../db.js";

export const EventosRepository = {
  // Listar todos los eventos
  async getEventos() {
    const result = await pool.query(`
      SELECT 
        e.id_evento,
        e.titulo,
        e.descripcion,
        e.lugar,
        e.fecha_inicio,
        e.estado_moderacion,
        e.fuente_origen,
        e.id_categoria,
        c.nombre_categoria
      FROM eventos_culturales e
      JOIN categorias c ON e.id_categoria = c.id_categoria
      ORDER BY e.fecha_inicio ASC
    `);
    return result.rows;
  },

  // Buscar evento por ID
  async findById(id) {
    const result = await pool.query(
      `SELECT 
        e.id_evento,
        e.titulo,
        e.descripcion,
        e.lugar,
        e.fecha_inicio,
        e.estado_moderacion,
        e.fuente_origen,
        e.id_categoria,
        c.nombre_categoria
      FROM eventos_culturales e
      JOIN categorias c ON e.id_categoria = c.id_categoria
      WHERE e.id_evento = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  // Crear evento
  async create({
    titulo,
    descripcion,
    lugar,
    fecha_inicio,
    estado_moderacion = "Pendiente",
    fuente_origen = "Manual",
    id_categoria,
  }) {
    const result = await pool.query(
      `INSERT INTO eventos_culturales (
        titulo, 
        descripcion, 
        lugar, 
        fecha_inicio, 
        estado_moderacion, 
        fuente_origen, 
        id_categoria
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        titulo,
        descripcion,
        lugar,
        fecha_inicio,
        estado_moderacion,
        fuente_origen,
        id_categoria,
      ],
    );
    return result.rows[0];
  },

  // Actualizar evento por ID
  async update(
    id,
    {
      titulo,
      descripcion,
      lugar,
      fecha_inicio,
      estado_moderacion,
      fuente_origen,
      id_categoria,
    },
  ) {
    const result = await pool.query(
      `UPDATE eventos_culturales 
       SET 
         titulo = $1,
         descripcion = $2,
         lugar = $3,
         fecha_inicio = $4,
         estado_moderacion = $5,
         fuente_origen = $6,
         id_categoria = $7
       WHERE id_evento = $8
       RETURNING *`,
      [
        titulo,
        descripcion,
        lugar,
        fecha_inicio,
        estado_moderacion,
        fuente_origen,
        id_categoria,
        id,
      ],
    );
    return result.rows[0] || null;
  },

  // Eliminar evento por ID
  async delete(id) {
    const result = await pool.query(
      `DELETE FROM eventos_culturales 
       WHERE id_evento = $1 
       RETURNING id_evento`,
      [id],
    );
    return result.rows[0] || null;
  },
};
