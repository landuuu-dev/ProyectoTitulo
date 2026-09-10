import { CategoriasRepository } from "../repositories/categorias.repository.js";

export const getCategorias = async (req, res) => {
  try {
    const categorias = await CategoriasRepository.getCategorias();
    return res.status(200).json(categorias);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al obtener categorías", details: error.message });
  }
};

export const createCategoria = async (req, res) => {
  try {
    const { nombre_categoria } = req.body;
    if (!nombre_categoria) {
      return res
        .status(400)
        .json({ error: "El nombre de la categoría es obligatorio" });
    }
    const nueva = await CategoriasRepository.create(nombre_categoria);
    return res.status(201).json(nueva);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al crear categoría", details: error.message });
  }
};

export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria } = req.body;

    if (!nombre_categoria) {
      return res
        .status(400)
        .json({ error: "El nombre de la categoría es obligatorio" });
    }

    const actualizada = await CategoriasRepository.update(id, nombre_categoria);
    if (!actualizada) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    return res.status(200).json(actualizada);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al actualizar categoría", details: error.message });
  }
};

export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await CategoriasRepository.delete(id);
    if (!eliminada)
      return res.status(404).json({ message: "Categoría no encontrada" });
    return res.status(200).json({ message: "Categoría eliminada con éxito" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al eliminar categoría", details: error.message });
  }
};
