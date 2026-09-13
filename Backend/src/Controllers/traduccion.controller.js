import { traducirTexto } from "../utils/traduccionService.js";

export const traducir = async (req, res) => {
  try {
    const { texto, idiomaOrigen, idiomaDestino } = req.body;

    if (!texto) {
      return res.status(400).json({
        mensaje: "El texto es obligatorio.",
      });
    }

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

    const traduccion = await traducirTexto(texto, idiomaOrigen, idiomaDestino);

    return res.status(200).json({
      traduccion,
      idiomaOrigen,
      idiomaDestino,
    });
  } catch (error) {
    console.error("Error traduciendo:", error);

    return res.status(500).json({
      mensaje: "Error al realizar la traducción.",
    });
  }
};
