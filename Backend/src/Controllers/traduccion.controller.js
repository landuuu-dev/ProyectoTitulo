import { traducirTexto, traducirTextos } from "../utils/traduccionService.js";

export const traducir = async (req, res) => {
  try {
    console.log("========== PETICIÓN TRADUCCIÓN ==========");

    console.log("BODY RECIBIDO:", JSON.stringify(req.body, null, 2));

    const { texto, textos, idiomaOrigen, idiomaDestino } = req.body;

    console.log("texto:", texto);
    console.log("textos:", textos);
    console.log("¿textos es array?:", Array.isArray(textos));
    console.log("cantidad:", Array.isArray(textos) ? textos.length : 0);

    const idiomasPermitidos = ["ES", "EN"];

    // =====================================================
    // VALIDAR IDIOMAS
    // =====================================================

    if (
      !idiomasPermitidos.includes(idiomaOrigen) ||
      !idiomasPermitidos.includes(idiomaDestino)
    ) {
      return res.status(400).json({
        mensaje: "Solo se permite traducir entre español e inglés.",
      });
    }

    // =====================================================
    // MISMO IDIOMA
    // =====================================================

    if (idiomaOrigen === idiomaDestino) {
      return res.status(400).json({
        mensaje: "El idioma de origen y destino deben ser diferentes.",
      });
    }

    // =====================================================
    // VARIOS TEXTOS
    // =====================================================

    if (Array.isArray(textos) && textos.length > 0) {
      console.log("TRADUCIENDO VARIOS TEXTOS:", textos.length);

      const traducciones = await traducirTextos(
        textos,
        idiomaOrigen,
        idiomaDestino,
      );

      console.log("TRADUCCIONES GENERADAS:", traducciones);

      return res.status(200).json({
        traducciones,
        idiomaOrigen,
        idiomaDestino,
      });
    }

    // =====================================================
    // UN SOLO TEXTO
    // =====================================================

    if (typeof texto === "string" && texto.trim().length > 0) {
      console.log("TRADUCIENDO UN SOLO TEXTO");

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

    // =====================================================
    // NO LLEGÓ TEXTO
    // =====================================================

    console.log("NO SE RECIBIÓ TEXTO NI TEXTOS");

    return res.status(400).json({
      mensaje: "Debe proporcionar texto o textos.",
      bodyRecibido: req.body,
    });
  } catch (error) {
    console.error("========== ERROR TRADUCCIÓN ==========");

    console.error(error);

    return res.status(500).json({
      mensaje: "Error al realizar la traducción.",
      error: error.message,
    });
  }
};
