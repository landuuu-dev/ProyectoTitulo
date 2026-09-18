import { scrapearEventosMunicipalidad } from "../services/scraper.service.js";

/* =========================================================
   PROBAR SCRAPER MUNICIPALIDAD
========================================================= */

export const probarScraperEventos = async (req, res) => {
  try {
    /*
        Solo administradores.
      */

    if (req.user.rol !== "Administrador") {
      return res.status(403).json({
        error: "No tienes permisos para ejecutar el scraper",
      });
    }

    /*
        Ejecutar scraper + guardar en BD.
      */

    const resultado = await scrapearEventosMunicipalidad();

    /*
        Respuesta.
      */

    return res.status(200).json({
      message: "Scraping realizado correctamente",

      ...resultado.estadisticas,

      eventos: resultado.eventos,
    });
  } catch (error) {
    console.error("Error en scraper:", error);

    return res.status(500).json({
      error: "Error ejecutando scraper",

      details: error.message,
    });
  }
};
