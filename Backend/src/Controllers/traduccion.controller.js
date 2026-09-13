import { traducirTexto, traducirTextos } from "../utils/traduccionService";

export const traducir = async (req, res) => {
  try {
    const { texto, textos, idiomaOrigen, idiomaDestino } = req.body;

    const idiomasPermitidos = ["ES", "EN"];

    if (
      !idiomasPermitidos.includes(idiomaOrigen) ||
      !idiomasPermitidos.includes(idiomaDestino)
    ) {
      return res.status(400).json({
        mensaje: "Solo se permite traducir entre español e inglés.",
      });
    }

    if (idiomaOrigen === idiomaDestino) {
      return res.status(400).json({
        mensaje: "El idioma de origen y destino deben ser diferentes.",
      });
    }

    // Traducción de varios textos
    if (Array.isArray(textos)) {
      const traducciones = await traducirTextos(
        textos,
        idiomaOrigen,
        idiomaDestino,
      );

      return res.status(200).json({
        traducciones,
        idiomaOrigen,
        idiomaDestino,
      });
    }

    // Traducción de un solo texto
    if (texto) {
      const traduccion = await traducirTexto(
        texto,
        idiomaOrigen,
        idiomaDestino,
      );

      return res.status(200).json({
        traduccion,
        idiomaOrigen,
        idiomaDestino,
      });
    }

    return res.status(400).json({
      mensaje: "Debe proporcionar texto o textos.",
    });
  } catch (error) {
    console.error("ERROR COMPLETO DE TRADUCCIÓN:", error);

    return res.status(500).json({
      mensaje: "Error al realizar la traducción.",
      error: error.message,
    });
  }
};
