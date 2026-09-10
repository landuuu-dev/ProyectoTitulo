import { FavoritosRepository } from "../repositories/favoritos.repository.js";

export const getMisFavoritos = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const favoritos =
      await FavoritosRepository.getFavoritosByUsuario(id_usuario);
    return res.status(200).json(favoritos);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al obtener favoritos", details: error.message });
  }
};

export const addFavorito = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { id_sitio, id_evento } = req.body;

    if (!id_sitio && !id_evento) {
      return res
        .status(400)
        .json({ error: "Debes enviar 'id_sitio' o 'id_evento'" });
    }

    let nuevo = null;
    if (id_sitio) {
      nuevo = await FavoritosRepository.addFavoritoSitio(id_usuario, id_sitio);
    } else if (id_evento) {
      nuevo = await FavoritosRepository.addFavoritoEvento(
        id_usuario,
        id_evento,
      );
    }

    return res
      .status(201)
      .json({ message: "Guardado en favoritos", favorito: nuevo });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al agregar favorito", details: error.message });
  }
};

export const removeFavorito = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { id_sitio } = req.params;

    const eliminado = await FavoritosRepository.removeFavoritoSitio(
      id_usuario,
      id_sitio,
    );
    if (!eliminado) {
      return res
        .status(404)
        .json({ message: "El sitio no estaba en tus favoritos" });
    }

    return res.status(200).json({ message: "Eliminado de favoritos" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error al eliminar favorito", details: error.message });
  }
};

export const removeFavoritoEvento = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { id_evento } = req.params;

    const eliminado = await FavoritosRepository.removeFavoritoEvento(
      id_usuario,
      id_evento,
    );
    if (!eliminado) {
      return res
        .status(404)
        .json({ message: "El evento no estaba en tus favoritos" });
    }

    return res.status(200).json({ message: "Evento eliminado de favoritos" });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: "Error al eliminar evento de favoritos",
        details: error.message,
      });
  }
};
