import { SitiosRepository } from "../repositories/sitios.repository.js";

// Listar los sitios
export const getSitios = async (req, res) => {
  try {
    const sitios = await SitiosRepository.getSitios();

    res.status(200).json(sitios);
  } catch (error) {
    res.status(500).json({
      error: "error al obtener sitios",
      details: error.message,
    });
  }
};

// Sitio por ID
export const findByIdSitios = async (req, res) => {
  const { id } = req.params;

  try {
    const sitio = await SitiosRepository.findByIdSitios(id);

    if (!sitio) {
      return res.status(404).json({
        message: "sitio no encontrado",
      });
    }

    res.status(200).json(sitio);
  } catch (error) {
    res.status(500).json({
      error: "error el sitio",
      details: error.message,
    });
  }
};

// Crear un sitio nuevo
export const create = async (req, res) => {
  try {
    const {
      titulo_es,
      titulo_en,
      descripcion_es,
      descripcion_en,
      longitud,
      latitud,
      imagen_url,
      audioguia_es_url,
      audioguia_en_url,
    } = req.body;

    // El ID del creador se extrae automáticamente del token
    const id_creador = req.user?.id || req.user?.id_usuario;

    // Validación básica de campos obligatorios
    if (
      !titulo_es ||
      !titulo_en ||
      !descripcion_es ||
      !descripcion_en ||
      longitud === undefined ||
      latitud === undefined
    ) {
      return res.status(400).json({
        error:
          "Los campos titulo_es, titulo_en, descripcion_es, descripcion_en, longitud y latitud son obligatorios.",
      });
    }

    const nuevoSitio = await SitiosRepository.create({
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
    });

    return res.status(201).json({
      message: "Sitio patrimonial creado exitosamente",
      sitio: nuevoSitio,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al crear el sitio patrimonial",
      details: error.message,
    });
  }
};

// Actualizar un sitio por ID
export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      titulo_es,
      titulo_en,
      descripcion_es,
      descripcion_en,
      longitud,
      latitud,
      imagen_url,
      audioguia_es_url,
      audioguia_en_url,
    } = req.body;

    if (
      !titulo_es ||
      !titulo_en ||
      !descripcion_es ||
      !descripcion_en ||
      longitud === undefined ||
      latitud === undefined
    ) {
      return res.status(400).json({
        error:
          "Los campos titulo_es, titulo_en, descripcion_es, descripcion_en, longitud y latitud son obligatorios.",
      });
    }

    const sitioActualizado = await SitiosRepository.update(id, {
      titulo_es,
      titulo_en,
      descripcion_es,
      descripcion_en,
      longitud,
      latitud,
      imagen_url,
      audioguia_es_url,
      audioguia_en_url,
    });

    if (!sitioActualizado) {
      return res.status(404).json({
        message: "Sitio patrimonial no encontrado para actualizar",
      });
    }

    return res.status(200).json({
      message: "Sitio patrimonial actualizado exitosamente",
      sitio: sitioActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al actualizar el sitio patrimonial",
      details: error.message,
    });
  }
};

// Eliminar un sitio por ID
export const deleteSitio = async (req, res) => {
  try {
    const { id } = req.params;

    const sitioEliminado = await SitiosRepository.deleteSitio(id);

    if (!sitioEliminado) {
      return res.status(404).json({
        message: "Sitio patrimonial no encontrado para eliminar",
      });
    }

    return res.status(200).json({
      message: "Sitio patrimonial eliminado exitosamente",
      id_sitio: sitioEliminado.id_sitio,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al eliminar el sitio patrimonial",
      details: error.message,
    });
  }
};

export const getSitiosCercanos = async (req, res) => {
  try {
    const { lat, lng, radio } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Debes proporcionar lat y lng en los parámetros de búsqueda",
      });
    }

    const sitios = await SitiosRepository.getCercanos(
      parseFloat(lat),
      parseFloat(lng),
      radio ? parseInt(radio) : 5000,
    );

    return res.status(200).json(sitios);
  } catch (error) {
    return res.status(500).json({
      error: "Error al buscar sitios cercanos",
      details: error.message,
    });
  }
};
