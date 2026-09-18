import axios from "axios";
import * as cheerio from "cheerio";
import { pool } from "../db.js";

const URL_EVENTOS = "https://www.muniarica.cl/eventos";
const BASE_URL = "https://www.muniarica.cl";
const BASE_DOCUMENTOS = "https://docs.muniarica.cl/";

/**
 * Limpia espacios innecesarios.
 */
function limpiarTexto(texto) {
  if (!texto) return "";

  return String(texto)
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

/**
 * Convierte una URL relativa en absoluta.
 */
function convertirUrlAbsoluta(url) {
  if (!url) return "";

  const urlLimpia = String(url).trim();

  if (!urlLimpia) return "";

  if (urlLimpia.startsWith("http://") || urlLimpia.startsWith("https://")) {
    return urlLimpia;
  }

  if (urlLimpia.startsWith("/")) {
    return `${BASE_URL}${urlLimpia}`;
  }

  return `${BASE_DOCUMENTOS}${urlLimpia}`;
}

/**
 * Obtiene el ID de la categoría desde nuestra BD.
 */
async function obtenerIdCategoria(nombreCategoria) {
  if (!nombreCategoria) {
    return null;
  }

  const resultado = await pool.query(
    `
      SELECT id_categoria
      FROM categorias
      WHERE LOWER(TRIM(nombre_categoria))
        = LOWER(TRIM($1))
      LIMIT 1
    `,
    [nombreCategoria],
  );

  if (resultado.rows.length === 0) {
    console.warn(`⚠️ Categoría no encontrada en BD: "${nombreCategoria}"`);

    return null;
  }

  return resultado.rows[0].id_categoria;
}

/**
 * Obtiene los enlaces de los eventos desde:
 * https://www.muniarica.cl/eventos
 */
async function obtenerEventosListado() {
  console.log("\n======================================");
  console.log("OBTENIENDO LISTADO DE EVENTOS");
  console.log("======================================");

  const respuesta = await axios.get(URL_EVENTOS, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    timeout: 30000,
  });

  console.log("STATUS:", respuesta.status);
  console.log("CONTENT-TYPE:", respuesta.headers["content-type"]);
  console.log("TAMAÑO HTML:", respuesta.data.length);

  const $ = cheerio.load(respuesta.data);

  const eventos = [];

  $("a[href*='/eventos/publicacion/']").each((_, elemento) => {
    const href = $(elemento).attr("href");

    if (!href) return;

    const url = convertirUrlAbsoluta(href);

    if (!eventos.some((evento) => evento.url === url)) {
      eventos.push({
        url,
      });
    }
  });

  console.log("Eventos encontrados en listado:", eventos.length);

  eventos.forEach((evento, index) => {
    console.log(`${index + 1}. ${evento.url}`);
  });

  return eventos;
}

/**
 * Busca el payload __NUXT_DATA__ de Nuxt.
 */
function obtenerNuxtData($) {
  let contenidoScript = null;

  const scriptNuxt = $("#__NUXT_DATA__");

  if (scriptNuxt.length > 0) {
    contenidoScript = scriptNuxt.html();
  }

  if (!contenidoScript) {
    const scriptNuxtAlternativo = $('script[data-nuxt-data="nuxt-app"]');

    if (scriptNuxtAlternativo.length > 0) {
      contenidoScript = scriptNuxtAlternativo.html();
    }
  }

  if (!contenidoScript) {
    $('script[type="application/json"]').each((_, script) => {
      if (contenidoScript) return;

      const texto = $(script).html() || "";

      if (texto.includes("evento-")) {
        contenidoScript = texto;
      }
    });
  }

  if (!contenidoScript) {
    throw new Error(
      "No se encontró el payload __NUXT_DATA__ de la Municipalidad",
    );
  }

  try {
    return JSON.parse(contenidoScript);
  } catch (error) {
    throw new Error(`No se pudo interpretar __NUXT_DATA__: ${error.message}`);
  }
}

/**
 * Resuelve las referencias internas utilizadas por Nuxt.
 *
 * Nuxt serializa sus objetos como un arreglo donde los valores
 * apuntan a otros índices del mismo arreglo.
 */
function crearResolverNuxt(data) {
  const cache = new Map();

  function resolver(indice) {
    if (indice === null || indice === undefined || typeof indice !== "number") {
      return indice;
    }

    // Valores especiales usados por serializadores.
    if (indice === -1) return undefined;
    if (indice === -2) return NaN;
    if (indice === -3) return Infinity;
    if (indice === -4) return -Infinity;

    if (indice < 0 || indice >= data.length) {
      return indice;
    }

    if (cache.has(indice)) {
      return cache.get(indice);
    }

    const valor = data[indice];

    // Primitivo
    if (valor === null || typeof valor !== "object") {
      return valor;
    }

    // Array
    if (Array.isArray(valor)) {
      const resultado = [];

      // Guardamos antes de resolver para evitar problemas
      // con referencias circulares.
      cache.set(indice, resultado);

      for (const elemento of valor) {
        if (typeof elemento === "number") {
          resultado.push(resolver(elemento));
        } else {
          resultado.push(elemento);
        }
      }

      return resultado;
    }

    // Objeto
    const resultado = {};

    cache.set(indice, resultado);

    for (const [clave, referencia] of Object.entries(valor)) {
      if (typeof referencia === "number") {
        resultado[clave] = resolver(referencia);
      } else {
        resultado[clave] = referencia;
      }
    }

    return resultado;
  }

  return resolver;
}

/**
 * Busca dentro del payload el índice correspondiente
 * al evento actual.
 *
 * Ejemplo:
 * evento-manana-dieciochera-parque-punta-norte
 */
function encontrarIndiceEvento(data, slug) {
  const claveEvento = `evento-${slug}`;

  for (let i = 0; i < data.length; i++) {
    const valor = data[i];

    if (
      valor &&
      typeof valor === "object" &&
      !Array.isArray(valor) &&
      Object.prototype.hasOwnProperty.call(valor, claveEvento)
    ) {
      return valor[claveEvento];
    }
  }

  return null;
}

/**
 * Extrae el slug desde:
 *
 * https://www.muniarica.cl/eventos/publicacion/mi-evento
 */
function obtenerSlugDesdeUrl(url) {
  const partes = url.split("/").filter(Boolean);

  return partes[partes.length - 1];
}

/**
 * Convierte el HTML de contenido del evento a texto.
 */
function convertirContenidoATexto(html) {
  if (!html) return "";

  const $ = cheerio.load(html);

  return limpiarTexto($.text());
}

/**
 * Scrapea el detalle de un evento.
 */
async function scrapearDetalleEvento(url) {
  console.log("\n--------------------------------------");
  console.log("Scrapeando detalle:", url);

  const respuesta = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    timeout: 30000,
  });

  const $ = cheerio.load(respuesta.data);

  const slug = obtenerSlugDesdeUrl(url);

  console.log("Slug:", slug);

  // --------------------------------------
  // Obtener datos Nuxt
  // --------------------------------------

  const nuxtData = obtenerNuxtData($);

  console.log("✓ __NUXT_DATA__ encontrado");

  const indiceEvento = encontrarIndiceEvento(nuxtData, slug);

  if (indiceEvento === null || indiceEvento === undefined) {
    throw new Error(
      `No se encontró el evento "${slug}" dentro de __NUXT_DATA__`,
    );
  }

  console.log("Índice del evento en Nuxt:", indiceEvento);

  const resolver = crearResolverNuxt(nuxtData);

  const eventoNuxt = resolver(indiceEvento);

  if (!eventoNuxt || typeof eventoNuxt !== "object") {
    throw new Error(`El evento "${slug}" no pudo ser resuelto desde Nuxt`);
  }

  // --------------------------------------
  // Datos principales
  // --------------------------------------

  const titulo = limpiarTexto(eventoNuxt.nombre);

  const descripcion = convertirContenidoATexto(eventoNuxt.contenido);

  const categoria = limpiarTexto(eventoNuxt.nombre_categoria);

  const fechaInicio = eventoNuxt.fecha_inicio || null;

  const fechaTermino = eventoNuxt.fecha_termino || null;

  // --------------------------------------
  // Imagen
  // --------------------------------------

  const imagenUrl = convertirUrlAbsoluta(eventoNuxt.foto);

  // --------------------------------------
  // Lugar y dirección
  // --------------------------------------

  let lugar = "";
  let direccion = "";

  if (eventoNuxt.direccion && typeof eventoNuxt.direccion === "object") {
    lugar = limpiarTexto(eventoNuxt.direccion.lugar);

    direccion = limpiarTexto(eventoNuxt.direccion.direccion);
  }

  // --------------------------------------
  // Datos para nuestra BD
  // --------------------------------------

  const evento = {
    titulo,
    descripcion,
    lugar,
    direccion,
    fecha_inicio: fechaInicio,
    fecha_termino: fechaTermino,
    categoria,
    imagen_url: imagenUrl,
    fuente_origen: url,
  };

  console.log("\nDatos extraídos:");
  console.log("Título:", evento.titulo);
  console.log("Categoría:", evento.categoria);
  console.log("Lugar:", evento.lugar);
  console.log("Dirección:", evento.direccion);
  console.log("Fecha inicio:", evento.fecha_inicio);
  console.log("Fecha término:", evento.fecha_termino);
  console.log("Imagen:", evento.imagen_url);

  return evento;
}

/**
 * Guarda el evento en PostgreSQL.
 */
async function guardarEvento(evento) {
  // --------------------------------------
  // Categoría
  // --------------------------------------

  const idCategoria = await obtenerIdCategoria(evento.categoria);

  if (!idCategoria) {
    throw new Error(
      `No existe la categoría "${evento.categoria}" en la tabla categorias`,
    );
  }

  // --------------------------------------
  // INSERT
  // --------------------------------------

  const resultado = await pool.query(
    `
      INSERT INTO eventos_culturales (
        titulo,
        descripcion,
        lugar,
        fecha_inicio,
        fecha_termino,
        estado_moderacion,
        fuente_origen,
        id_categoria,
        imagen_url,
        url_origen
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      ON CONFLICT (url_origen)
      DO NOTHING
      RETURNING id_evento
    `,
    [
      evento.titulo,
      evento.descripcion,
      evento.lugar,
      evento.fecha_inicio,
      evento.fecha_termino,
      "Pendiente",
      "Scraper_Muni",
      idCategoria,
      evento.imagen_url,
      evento.fuente_origen,
    ],
  );

  if (resultado.rows.length === 0) {
    return {
      insertado: false,
      duplicado: true,
      id_evento: null,
    };
  }

  return {
    insertado: true,
    duplicado: false,
    id_evento: resultado.rows[0].id_evento,
  };
}

/**
 * Ejecuta todo el proceso:
 *
 * 1. Obtiene listado
 * 2. Entra a cada evento
 * 3. Extrae datos desde Nuxt
 * 4. Busca categoría en BD
 * 5. Guarda como Pendiente
 * 6. Evita duplicados por URL
 */
export async function scrapearEventosMunicipalidad() {
  console.log("\n");
  console.log("======================================");
  console.log("INICIANDO SCRAPER MUNICIPALIDAD");
  console.log("======================================");

  const eventosListado = await obtenerEventosListado();

  console.log(`\nEncontrados: ${eventosListado.length}`);

  const resultados = [];

  let procesados = 0;
  let insertados = 0;
  let duplicados = 0;
  let errores = 0;

  for (const item of eventosListado) {
    try {
      const evento = await scrapearDetalleEvento(item.url);

      procesados++;

      const resultado = await guardarEvento(evento);

      if (resultado.insertado) {
        insertados++;

        console.log(
          `✓ Evento insertado correctamente. ID: ${resultado.id_evento}`,
        );
      } else if (resultado.duplicado) {
        duplicados++;

        console.log("↪ Evento duplicado. No se insertó nuevamente.");
      }

      resultados.push({
        ...evento,
        ...resultado,
      });
    } catch (error) {
      errores++;

      console.error(`✗ Error procesando ${item.url}`);

      console.error(error.message);

      resultados.push({
        url: item.url,
        error: error.message,
      });
    }
  }

  console.log("\n======================================");
  console.log("RESULTADO DEL SCRAPER");
  console.log("======================================");

  console.log("Encontrados:", eventosListado.length);

  console.log("Procesados:", procesados);

  console.log("Insertados:", insertados);

  console.log("Duplicados:", duplicados);

  console.log("Errores:", errores);

  console.log("======================================\n");

  return {
    encontrados: eventosListado.length,
    procesados,
    insertados,
    duplicados,
    errores,
    eventos: resultados,
  };
}
