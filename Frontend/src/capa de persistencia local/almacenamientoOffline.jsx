import { openDB } from "idb";

const DB_NAME = "rastros-desierto";
const DB_VERSION = 2;

const CACHE_MAPAS = "mapas-sitios";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("sitios")) {
      db.createObjectStore("sitios", {
        keyPath: "id_sitio",
      });
    }

    if (!db.objectStoreNames.contains("rutas")) {
      db.createObjectStore("rutas", {
        keyPath: "clave",
      });
    }

    if (!db.objectStoreNames.contains("recursos")) {
      db.createObjectStore("recursos", {
        keyPath: "clave",
      });
    }

    if (!db.objectStoreNames.contains("descargas")) {
      db.createObjectStore("descargas", {
        keyPath: "id_sitio",
      });
    }
  },
});

/* =========================================================
   SITIOS
========================================================= */

export async function guardarSitiosOffline(sitios) {
  const db = await dbPromise;

  const tx = db.transaction("sitios", "readwrite");

  for (const sitio of sitios) {
    await tx.store.put(sitio);
  }

  await tx.done;
}

export async function obtenerSitiosOffline() {
  const db = await dbPromise;

  return await db.getAll("sitios");
}

export async function obtenerSitioOffline(idSitio) {
  const db = await dbPromise;

  return await db.get("sitios", Number(idSitio));
}

/* =========================================================
   ESTADO DE DESCARGA OFFLINE
========================================================= */

export async function marcarSitioDescargado(idSitio) {
  const db = await dbPromise;

  await db.put("descargas", {
    id_sitio: Number(idSitio),
    descargado: true,
    fecha: Date.now(),
  });
}

export async function verificarSitioDescargado(idSitio) {
  const db = await dbPromise;

  const descarga = await db.get("descargas", Number(idSitio));

  return Boolean(descarga?.descargado);
}

export async function obtenerSitiosDescargados() {
  const db = await dbPromise;

  return await db.getAll("descargas");
}

export async function eliminarSitioDescargado(idSitio) {
  const db = await dbPromise;

  await db.delete("descargas", Number(idSitio));
}

/* =========================================================
   RUTAS
========================================================= */

export async function guardarRutaOffline(idSitio, ruta) {
  const db = await dbPromise;

  await db.put("rutas", {
    clave: String(idSitio),
    id_sitio: Number(idSitio),
    ruta,
    fecha: Date.now(),
  });
}

export async function obtenerRutaOffline(idSitio) {
  const db = await dbPromise;

  return await db.get("rutas", String(idSitio));
}

/* =========================================================
   RECURSOS
   Imagen / Audioguía
========================================================= */

export async function guardarRecursoOffline(idSitio, tipo, blob) {
  const db = await dbPromise;

  await db.put("recursos", {
    clave: `${idSitio}-${tipo}`,
    id_sitio: Number(idSitio),
    tipo,
    blob,
    fecha: Date.now(),
  });
}

export async function obtenerRecursoOffline(idSitio, tipo) {
  const db = await dbPromise;

  return await db.get("recursos", `${idSitio}-${tipo}`);
}

export async function eliminarRecursosOffline(idSitio) {
  const db = await dbPromise;

  const tx = db.transaction("recursos", "readwrite");

  await tx.store.delete(`${idSitio}-imagen`);

  await tx.store.delete(`${idSitio}-audioguia`);

  await tx.done;
}

/* =========================================================
   MAPA OFFLINE
========================================================= */

export async function guardarTileMapaOffline(urlTile) {
  try {
    const cache = await caches.open(CACHE_MAPAS);

    const existente = await cache.match(urlTile);

    if (existente) {
      return true;
    }

    const response = await fetch(urlTile);

    if (!response.ok) {
      throw new Error(`No se pudo descargar el tile: ${response.status}`);
    }

    await cache.put(urlTile, response.clone());

    return true;
  } catch (error) {
    console.error("Error guardando tile del mapa:", error);

    return false;
  }
}

export async function obtenerTileMapaOffline(urlTile) {
  try {
    const cache = await caches.open(CACHE_MAPAS);

    return await cache.match(urlTile);
  } catch (error) {
    console.error("Error obteniendo tile offline:", error);

    return undefined;
  }
}

/* =========================================================
   TILES
========================================================= */

export function generarUrlTile(z, x, y) {
  const subdominio = ["a", "b", "c"][Math.abs(x + y) % 3];

  return `https://${subdominio}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

export function coordenadasATile(latitud, longitud, zoom) {
  const latRad = (Number(latitud) * Math.PI) / 180;

  const n = Math.pow(2, zoom);

  const x = Math.floor(((Number(longitud) + 180) / 360) * n);

  const y = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);

  return {
    x,
    y,
    z: zoom,
  };
}

/* =========================================================
   DESCARGAR MAPA DE UN SITIO
========================================================= */

export async function descargarMapaSitio({
  latitud,
  longitud,
  zoom = 16,
  radio = 2,
  onProgress,
}) {
  const centro = coordenadasATile(latitud, longitud, zoom);

  const tiles = [];

  for (let x = centro.x - radio; x <= centro.x + radio; x++) {
    for (let y = centro.y - radio; y <= centro.y + radio; y++) {
      tiles.push({
        x,
        y,
        z: zoom,
      });
    }
  }

  const total = tiles.length;

  let completados = 0;
  let exitosos = 0;

  for (const tile of tiles) {
    const url = generarUrlTile(tile.z, tile.x, tile.y);

    const guardado = await guardarTileMapaOffline(url);

    if (guardado) {
      exitosos++;
    }

    completados++;

    if (onProgress) {
      onProgress({
        completados,
        total,
        porcentaje: Math.round((completados / total) * 100),
      });
    }
  }

  return {
    total,
    exitosos,
  };
}

/* =========================================================
   COMPROBAR MAPA OFFLINE
========================================================= */

export async function hayMapaOffline(latitud, longitud, zoom = 16, radio = 2) {
  try {
    const centro = coordenadasATile(latitud, longitud, zoom);

    const cache = await caches.open(CACHE_MAPAS);

    const posiciones = [
      [centro.x, centro.y],
      [centro.x - radio, centro.y - radio],
      [centro.x + radio, centro.y + radio],
    ];

    let encontrados = 0;

    for (const [x, y] of posiciones) {
      const url = generarUrlTile(zoom, x, y);

      const resultado = await cache.match(url);

      if (resultado) {
        encontrados++;
      }
    }

    return encontrados > 0;
  } catch (error) {
    console.error("Error comprobando mapa offline:", error);

    return false;
  }
}

/* =========================================================
   ELIMINAR MAPA OFFLINE
========================================================= */

export async function eliminarMapaOffline() {
  try {
    return await caches.delete(CACHE_MAPAS);
  } catch (error) {
    console.error("Error eliminando mapas offline:", error);

    return false;
  }
}
