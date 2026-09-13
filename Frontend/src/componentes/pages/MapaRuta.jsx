import React, { useEffect, useRef, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "./estilosPages/mapaRuta.css";

import {
  guardarRutaOffline,
  obtenerRutaOffline,
  obtenerRecursoOffline,
} from "../../servicios/almacenamientoOffline";

/* =========================================================
   ICONOS
========================================================= */

const iconoUsuario = L.divIcon({
  className: "mapa-ruta-icono-usuario",
  html: `
    <div class="mapa-ruta-marker-usuario">
      📍
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const iconoDestino = L.divIcon({
  className: "mapa-ruta-icono-destino",
  html: `
    <div class="mapa-ruta-marker-destino">
      🏛️
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44],
});

/* =========================================================
   CENTRAR MAPA
========================================================= */

function CentrarMapa({ posicionUsuario, siguiendo }) {
  const map = useMap();

  useEffect(() => {
    if (!posicionUsuario || !siguiendo) {
      return;
    }

    map.setView(
      [posicionUsuario.lat, posicionUsuario.lng],
      Math.max(map.getZoom(), 16),
      {
        animate: true,
      },
    );
  }, [posicionUsuario, siguiendo, map]);

  return null;
}

/* =========================================================
   DISTANCIA ENTRE DOS COORDENADAS
========================================================= */

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const radioTierra = 6371000;

  const diferenciaLat = ((lat2 - lat1) * Math.PI) / 180;

  const diferenciaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(diferenciaLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(diferenciaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radioTierra * c;
}

/* =========================================================
   FORMATEAR DISTANCIA
========================================================= */

function formatearDistancia(metros) {
  if (metros === null || metros === undefined) {
    return "";
  }

  if (metros < 1000) {
    return `${Math.round(metros)} m`;
  }

  return `${(metros / 1000).toFixed(1)} km`;
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function MapaRuta({
  latitud,
  longitud,
  titulo = "Sitio patrimonial",
  audioguiaUrl = "",
  idSitio,
  onCerrar,
}) {
  const destino = {
    lat: Number(latitud),
    lng: Number(longitud),
  };

  /* =======================================================
     ESTADOS
  ======================================================= */

  const [posicionUsuario, setPosicionUsuario] = useState(null);

  const [ruta, setRuta] = useState([]);

  const [distancia, setDistancia] = useState(null);

  const [cargandoGPS, setCargandoGPS] = useState(true);

  const [errorGPS, setErrorGPS] = useState("");

  const [errorRuta, setErrorRuta] = useState("");

  const [siguiendo, setSiguiendo] = useState(true);

  const [haLlegado, setHaLlegado] = useState(false);

  const [mostrarAudioguia, setMostrarAudioguia] = useState(false);

  const [reproduciendo, setReproduciendo] = useState(false);

  const [modoOffline, setModoOffline] = useState(!navigator.onLine);

  const [rutaDisponibleOffline, setRutaDisponibleOffline] = useState(false);

  const [audioguiaOffline, setAudioguiaOffline] = useState(null);

  /* =======================================================
     REFS
  ======================================================= */

  const watchIdRef = useRef(null);

  const audioRef = useRef(null);

  const llegadaDetectadaRef = useRef(false);

  const ultimaPosicionRutaRef = useRef(null);

  const ultimaConsultaRutaRef = useRef(0);

  /* =======================================================
     DETECTAR CONEXIÓN
  ======================================================= */

  useEffect(() => {
    const cuandoConecta = () => {
      setModoOffline(false);
    };

    const cuandoDesconecta = () => {
      setModoOffline(true);
    };

    window.addEventListener("online", cuandoConecta);

    window.addEventListener("offline", cuandoDesconecta);

    return () => {
      window.removeEventListener("online", cuandoConecta);

      window.removeEventListener("offline", cuandoDesconecta);
    };
  }, []);

  /* =======================================================
     CARGAR AUDIO OFFLINE
  ======================================================= */

  useEffect(() => {
    const cargarAudioguiaOffline = async () => {
      if (!idSitio) {
        return;
      }

      try {
        const recurso = await obtenerRecursoOffline(idSitio, "audioguia");

        if (recurso?.blob) {
          const url = URL.createObjectURL(recurso.blob);

          setAudioguiaOffline(url);
        }
      } catch (error) {
        console.error("Error cargando audioguía offline:", error);
      }
    };

    cargarAudioguiaOffline();

    return () => {
      setAudioguiaOffline((urlAnterior) => {
        if (urlAnterior) {
          URL.revokeObjectURL(urlAnterior);
        }

        return null;
      });
    };
  }, [idSitio]);

  /* =======================================================
     GPS
  ======================================================= */

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorGPS("Tu navegador no permite obtener la ubicación.");

      setCargandoGPS(false);

      return;
    }

    setCargandoGPS(true);
    setErrorGPS("");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nuevaPosicion = {
          lat: position.coords.latitude,

          lng: position.coords.longitude,

          accuracy: position.coords.accuracy,
        };

        setPosicionUsuario(nuevaPosicion);

        setCargandoGPS(false);

        /* ---------------------------------------------
             DISTANCIA AL DESTINO
          --------------------------------------------- */

        const nuevaDistancia = calcularDistancia(
          nuevaPosicion.lat,
          nuevaPosicion.lng,
          destino.lat,
          destino.lng,
        );

        setDistancia(nuevaDistancia);

        /* ---------------------------------------------
             DETECTAR LLEGADA
          --------------------------------------------- */

        const RADIO_LLEGADA = 50;

        if (nuevaDistancia <= RADIO_LLEGADA && !llegadaDetectadaRef.current) {
          llegadaDetectadaRef.current = true;

          setHaLlegado(true);

          if (audioguiaUrl || audioguiaOffline) {
            setMostrarAudioguia(true);
          }
        }

        /*
         * Si se aleja bastante después
         * de haber llegado, permitimos
         * detectar nuevamente la llegada.
         */

        if (nuevaDistancia > RADIO_LLEGADA + 30) {
          llegadaDetectadaRef.current = false;

          setHaLlegado(false);
        }
      },

      (error) => {
        console.error("Error obteniendo ubicación:", error);

        setCargandoGPS(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorGPS(
              "Debes permitir el acceso a tu ubicación para calcular la ruta.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setErrorGPS("No se pudo obtener tu ubicación actual.");
            break;

          case error.TIMEOUT:
            setErrorGPS("La ubicación tardó demasiado en responder.");
            break;

          default:
            setErrorGPS("No se pudo obtener tu ubicación.");
        }
      },

      {
        enableHighAccuracy: true,

        maximumAge: 5000,

        timeout: 15000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);

        watchIdRef.current = null;
      }
    };
  }, [destino.lat, destino.lng, audioguiaUrl, audioguiaOffline]);

  /* =======================================================
     OBTENER RUTA
  ======================================================= */

  useEffect(() => {
    if (!posicionUsuario || !idSitio) {
      return;
    }

    const obtenerRuta = async () => {
      /*
       * Si estamos offline,
       * no hacemos ninguna petición.
       */

      if (!navigator.onLine) {
        try {
          const rutaGuardada = await obtenerRutaOffline(idSitio);

          if (rutaGuardada?.ruta?.length) {
            setRuta(rutaGuardada.ruta);

            setRutaDisponibleOffline(true);

            setErrorRuta("");

            console.log("Ruta cargada desde IndexedDB.");
          } else {
            setRuta([]);

            setRutaDisponibleOffline(false);

            setErrorRuta(
              "No tienes una ruta guardada para este sitio. Debes calcularla una vez con internet.",
            );
          }
        } catch (error) {
          console.error("Error obteniendo ruta offline:", error);

          setErrorRuta("No se pudo cargar la ruta offline.");
        }

        return;
      }

      /*
       * ONLINE
       *
       * No recalculamos la ruta
       * en cada actualización del GPS.
       */

      const ahora = Date.now();

      const ultimaPosicion = ultimaPosicionRutaRef.current;

      const ultimaConsulta = ultimaConsultaRutaRef.current;

      /*
       * Esperamos al menos 10 segundos
       * entre consultas.
       */

      if (ahora - ultimaConsulta < 10000) {
        return;
      }

      /*
       * Si ya teníamos una posición,
       * solamente recalculamos si el
       * usuario se ha movido más de 30 m.
       */

      if (ultimaPosicion) {
        const movimiento = calcularDistancia(
          ultimaPosicion.lat,
          ultimaPosicion.lng,
          posicionUsuario.lat,
          posicionUsuario.lng,
        );

        if (movimiento < 30) {
          return;
        }
      }

      ultimaPosicionRutaRef.current = posicionUsuario;

      ultimaConsultaRutaRef.current = ahora;

      try {
        setErrorRuta("");

        const url =
          `https://router.project-osrm.org/route/v1/foot/` +
          `${posicionUsuario.lng},${posicionUsuario.lat};` +
          `${destino.lng},${destino.lat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("No se pudo calcular la ruta.");
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          throw new Error("No se encontró una ruta.");
        }

        const coordenadas = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng],
        );

        setRuta(coordenadas);

        /*
         * Guardamos la ruta
         * para usarla offline.
         */

        try {
          await guardarRutaOffline(idSitio, coordenadas);

          setRutaDisponibleOffline(true);

          console.log("Ruta guardada para uso offline.");
        } catch (errorGuardar) {
          console.error("No se pudo guardar la ruta offline:", errorGuardar);
        }
      } catch (error) {
        console.error("Error calculando ruta:", error);

        /*
         * Si falla la red aunque
         * navigator.onLine diga true,
         * intentamos usar la ruta
         * guardada.
         */

        try {
          const rutaGuardada = await obtenerRutaOffline(idSitio);

          if (rutaGuardada?.ruta?.length) {
            setRuta(rutaGuardada.ruta);

            setRutaDisponibleOffline(true);

            setErrorRuta("Sin conexión. Usando la última ruta guardada.");

            return;
          }
        } catch (errorOffline) {
          console.error("Error usando ruta offline:", errorOffline);
        }

        setErrorRuta("No se pudo calcular la ruta hasta este sitio.");
      }
    };

    obtenerRuta();
  }, [posicionUsuario, destino.lat, destino.lng, idSitio]);

  /* =======================================================
     REPRODUCIR AUDIO
  ======================================================= */

  const reproducirAudioguia = () => {
    /*
     * Si existe una versión
     * descargada, usamos esa.
     */

    const fuenteAudio = audioguiaOffline || audioguiaUrl;

    if (!fuenteAudio) {
      return;
    }

    if (!audioRef.current || audioRef.current.src !== fuenteAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(fuenteAudio);

      audioRef.current.addEventListener("ended", () => {
        setReproduciendo(false);
      });

      audioRef.current.addEventListener("pause", () => {
        setReproduciendo(false);
      });
    }

    audioRef.current
      .play()
      .then(() => {
        setReproduciendo(true);
      })
      .catch((error) => {
        console.error("No se pudo reproducir la audioguía:", error);
      });
  };

  /* =======================================================
     PAUSAR AUDIO
  ======================================================= */

  const pausarAudioguia = () => {
    if (audioRef.current) {
      audioRef.current.pause();

      setReproduciendo(false);
    }
  };

  /* =======================================================
     CERRAR MAPA
  ======================================================= */

  const cerrarMapa = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);

      watchIdRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();

      audioRef.current.currentTime = 0;
    }

    setReproduciendo(false);

    if (onCerrar) {
      onCerrar();
    }
  };

  /* =======================================================
     COORDENADAS INVÁLIDAS
  ======================================================= */

  if (!Number.isFinite(destino.lat) || !Number.isFinite(destino.lng)) {
    return (
      <div className="mapa-ruta-overlay">
        <div className="mapa-ruta-modal">
          <div className="mapa-ruta-error">
            <h3>📍 Ubicación no disponible</h3>

            <p>Este sitio no tiene coordenadas válidas.</p>

            <button type="button" onClick={cerrarMapa}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mapa-ruta-overlay">
      <div className="mapa-ruta-modal">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mapa-ruta-header">
          <div>
            <span className="mapa-ruta-subtitulo">Cómo llegar</span>

            <h2>{titulo}</h2>
          </div>

          <button
            type="button"
            className="mapa-ruta-cerrar"
            onClick={cerrarMapa}
            aria-label="Cerrar mapa"
          >
            ×
          </button>
        </div>

        {/* =================================================
            INFORMACIÓN
        ================================================= */}

        <div className="mapa-ruta-info">
          {/* ESTADO OFFLINE */}

          {modoOffline && (
            <div className="mapa-ruta-estado mapa-ruta-estado-offline">
              📡 Modo sin conexión
            </div>
          )}

          {/* GPS */}

          {cargandoGPS && (
            <div className="mapa-ruta-estado">
              📍 Obteniendo tu ubicación...
            </div>
          )}

          {/* DISTANCIA */}

          {posicionUsuario && !haLlegado && (
            <div className="mapa-ruta-distancia">
              🧭 Distancia aproximada:{" "}
              <strong>{formatearDistancia(distancia)}</strong>
            </div>
          )}

          {/* LLEGADA */}

          {haLlegado && (
            <div className="mapa-ruta-llegada-mini">
              🎉 ¡Estás cerca del sitio!
            </div>
          )}

          {/* RUTA OFFLINE */}

          {modoOffline && rutaDisponibleOffline && (
            <div className="mapa-ruta-estado">🧭 Usando ruta guardada</div>
          )}

          {/* ERROR GPS */}

          {errorGPS && <div className="mapa-ruta-error">⚠️ {errorGPS}</div>}

          {/* ERROR RUTA */}

          {errorRuta && <div className="mapa-ruta-error">⚠️ {errorRuta}</div>}
        </div>

        {/* =================================================
            MAPA
        ================================================= */}

        <div className="mapa-ruta-contenedor">
          <MapContainer
            center={[destino.lat, destino.lng]}
            zoom={15}
            scrollWheelZoom={true}
            className="mapa-ruta"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* DESTINO */}

            <Marker position={[destino.lat, destino.lng]} icon={iconoDestino}>
              <Popup>
                <strong>🏛️ {titulo}</strong>
              </Popup>
            </Marker>

            {/* USUARIO */}

            {posicionUsuario && (
              <Marker
                position={[posicionUsuario.lat, posicionUsuario.lng]}
                icon={iconoUsuario}
              >
                <Popup>
                  📍 Tu ubicación
                  <br />
                  Precisión aproximada: {Math.round(posicionUsuario.accuracy)} m
                </Popup>
              </Marker>
            )}

            {/* RUTA */}

            {ruta.length > 0 && (
              <Polyline
                positions={ruta}
                pathOptions={{
                  color: "#5b8c5a",
                  weight: 6,
                  opacity: 0.85,
                }}
              />
            )}

            <CentrarMapa
              posicionUsuario={posicionUsuario}
              siguiendo={siguiendo}
            />
          </MapContainer>

          {/* SEGUIR GPS */}

          {posicionUsuario && (
            <button
              type="button"
              className="mapa-ruta-seguir"
              onClick={() => setSiguiendo(!siguiendo)}
            >
              {siguiendo ? "📍 Siguiendo ubicación" : "🎯 Centrar en mí"}
            </button>
          )}
        </div>

        {/* =================================================
            AUDIOGUÍA
        ================================================= */}

        {mostrarAudioguia && (
          <div className="mapa-ruta-audioguia-overlay">
            <div className="mapa-ruta-audioguia">
              <button
                type="button"
                className="mapa-ruta-audioguia-cerrar"
                onClick={() => setMostrarAudioguia(false)}
                aria-label="Cerrar"
              >
                ×
              </button>

              <div className="mapa-ruta-audioguia-icono">🎧</div>

              <span className="mapa-ruta-audioguia-tag">¡Has llegado!</span>

              <h3>Ya estás en {titulo}</h3>

              <p>
                Ahora puedes escuchar la audioguía de este sitio patrimonial.
              </p>

              {audioguiaOffline && (
                <p className="mapa-ruta-audio-offline">
                  📥 Audioguía disponible sin conexión
                </p>
              )}

              <div className="mapa-ruta-audioguia-acciones">
                {!reproduciendo ? (
                  <button
                    type="button"
                    className="mapa-ruta-boton-audio"
                    onClick={reproducirAudioguia}
                  >
                    🎧 Escuchar audioguía
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mapa-ruta-boton-audio"
                    onClick={pausarAudioguia}
                  >
                    ⏸️ Pausar audioguía
                  </button>
                )}

                <button
                  type="button"
                  className="mapa-ruta-boton-secundario"
                  onClick={() => setMostrarAudioguia(false)}
                >
                  Ahora no
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
