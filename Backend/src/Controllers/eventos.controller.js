import { EventosRepository } from "../repositories/eventos.repository";

// Listar eventos
export const getEventos = async (req, res) => {
  try {
    const eventos = await EventosRepository.getEventos();
    return res.status(200).json(eventos);
  } catch (error) {
    return res.status(500).json({
      error: "Error al obtener los eventos culturales",
      details: error.message,
    });
  }
};

// Obtener evento por ID
export const findByIdEventos = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await EventosRepository.findById(id);

    if (!evento) {
      return res.status(404).json({ message: "Evento cultural no encontrado" });
    }

    return res.status(200).json(evento);
  } catch (error) {
    return res.status(500).json({
      error: "Error al buscar el evento cultural",
      details: error.message,
    });
  }
};

export const createEvento = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      lugar,
      fecha_inicio,
      estado_moderacion,
      fuente_origen,
      imagen_url,
      id_categoria,
    } = req.body;

    if (!titulo || !descripcion || !lugar || !fecha_inicio || !id_categoria) {
      return res.status(400).json({
        error:
          "Los campos titulo, descripcion, lugar, fecha_inicio e id_categoria son obligatorios.",
      });
    }

    const nuevoEvento = await EventosRepository.create({
      titulo,
      descripcion,
      lugar,
      fecha_inicio,
      estado_moderacion,
      fuente_origen,
      imagen_url,
      id_categoria,
    });

    return res.status(201).json({
      message: "Evento cultural registrado exitosamente",
      evento: nuevoEvento,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al registrar el evento cultural",
      details: error.message,
    });
  }
};

export const updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      lugar,
      fecha_inicio,
      estado_moderacion,
      fuente_origen,
      imagen_url,
      id_categoria,
    } = req.body;

    if (!titulo || !descripcion || !lugar || !fecha_inicio || !id_categoria) {
      return res.status(400).json({
        error:
          "Los campos titulo, descripcion, lugar, fecha_inicio e id_categoria son obligatorios.",
      });
    }

    const eventoActualizado = await EventosRepository.update(id, {
      titulo,
      descripcion,
      lugar,
      fecha_inicio,
      estado_moderacion,
      fuente_origen,
      imagen_url,
      id_categoria,
    });

    if (!eventoActualizado) {
      return res
        .status(404)
        .json({ message: "Evento cultural no encontrado para actualizar" });
    }

    return res.status(200).json({
      message: "Evento cultural actualizado exitosamente",
      evento: eventoActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al actualizar el evento cultural",
      details: error.message,
    });
  }
};
// Eliminar evento
export const deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const eventoEliminado = await EventosRepository.delete(id);

    if (!eventoEliminado) {
      return res
        .status(404)
        .json({ message: "Evento cultural no encontrado para eliminar" });
    }

    return res.status(200).json({
      message: "Evento cultural eliminado exitosamente",
      id_evento: eventoEliminado.id_evento,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al eliminar el evento cultural",
      details: error.message,
    });
  }
};
