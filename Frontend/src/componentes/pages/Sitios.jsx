import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import MapaRuta from "./MapaRuta";
import ModalDetalle from "../componentes-fijos/ModalDetalle";
import "./estilosPages/sitios.css";
import cerroImg from "../../assets/cerro.png";

import {
  guardarSitiosOffline,
  obtenerSitiosOffline,
  guardarRutaOffline,
  guardarRecursoOffline,
  obtenerRecursoOffline,
  marcarSitioDescargado,
  verificarSitioDescargado,
  obtenerSitiosDescargados,
  descargarMapaSitio,
} from "../../servicios/almacenamientoOffline";

const API_URL = import.meta.env.VITE_API_URL;

export default function Sitios() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sitioParaRuta, setSitioParaRuta] = useState(null);
  const [data, setData] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [busqueda, setBusqueda] = useState(searchParams.get("buscar") || "");

  const [cargando, setCargando] = useState(true);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(false);
  const [procesandoFavorito, setProcesandoFavorito] = useState(null);

  const [descargandoSitio, setDescargandoSitio] = useState(null);
  const [progresoDescarga, setProgresoDescarga] = useState(null);

  const [sitiosOffline, setSitiosOffline] = useState([]);

  const [imagenesOffline, setImagenesOffline] = useState({});
  const [audiosOffline, setAudiosOffline] = useState({});

  const [error, setError] = useState("");
  const [sinConexion, setSinConexion] = useState(!navigator.onLine);

  // =========================================
  // MODAL
  // =========================================

  const [modalAbierto, setModalAbierto] = useState(false);
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);

  // =========================================
  // DETECTAR CONEXIÓN
  // =========================================

  useEffect(() => {
    const cuandoConecta = () => {
      setSinConexion(false);
    };

    const cuandoDesconecta = () => {
      setSinConexion(true);
    };

    window.addEventListener("online", cuandoConecta);

    window.addEventListener("offline", cuandoDesconecta);

    return () => {
      window.removeEventListener("online", cuandoConecta);

      window.removeEventListener("offline", cuandoDesconecta);
    };
  }, []);

  // =========================================
  // CARGAR SITIOS
  // =========================================

  useEffect(() => {
    cargarSitios();
  }, []);

  useEffect(() => {
    cargarFavoritos();
  }, []);

  useEffect(() => {
    setBusqueda(searchParams.get("buscar") || "");
  }, [searchParams]);

  // =========================================
  // CARGAR RECURSOS OFFLINE
  // =========================================

  useEffect(() => {
    cargarRecursosOffline();

    return () => {
      Object.values(imagenesOffline).forEach((url) => {
        URL.revokeObjectURL(url);
      });

      Object.values(audiosOffline).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [sitiosOffline, data]);

  // =========================================
  // TOKEN
  // =========================================

  const obtenerToken = () => {
    return sessionStorage.getItem("token");
  };

  const obtenerHeadersAuth = () => {
    const token = obtenerToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // =========================================
  // CARGAR SITIOS DESDE API O INDEXEDDB
  // =========================================

  const cargarSitios = async () => {
    try {
      setCargando(true);
      setError("");

      // SIN INTERNET

      if (!navigator.onLine) {
        const sitiosOffline = await obtenerSitiosOffline();

        setData(sitiosOffline);

        const descargas = await obtenerSitiosDescargados();

        setSitiosOffline(descargas.map((sitio) => Number(sitio.id_sitio)));

        if (sitiosOffline.length === 0) {
          setError(
            "No hay conexión y todavía no tienes sitios guardados para usar sin conexión.",
          );
        }

        return;
      }

      // CON INTERNET

      const response = await axios.get(`${API_URL}/sitios`, {
        timeout: 8000,
      });

      const sitios = response.data || [];

      setData(sitios);

      // Guardamos solamente la información básica.
      // Esto NO significa que el sitio esté
      // completamente descargado offline.

      try {
        await guardarSitiosOffline(sitios);

        const descargas = await obtenerSitiosDescargados();

        setSitiosOffline(descargas.map((sitio) => Number(sitio.id_sitio)));
      } catch (offlineError) {
        console.error(
          "No se pudieron guardar los sitios offline:",
          offlineError,
        );
      }
    } catch (error) {
      console.error("Error cargando sitios:", error);

      // Si falla la API, intentamos IndexedDB.

      try {
        const sitiosOffline = await obtenerSitiosOffline();

        if (sitiosOffline.length > 0) {
          setData(sitiosOffline);

          const descargas = await obtenerSitiosDescargados();

          setSitiosOffline(descargas.map((sitio) => Number(sitio.id_sitio)));

          setSinConexion(true);

          return;
        }

        setError("No se pudieron cargar los sitios turísticos.");
      } catch (offlineError) {
        console.error("Error obteniendo sitios offline:", offlineError);

        setError("No se pudieron cargar los sitios turísticos.");
      }
    } finally {
      setCargando(false);
    }
  };

  // =========================================
  // CARGAR IMÁGENES Y AUDIO OFFLINE
  // =========================================

  const cargarRecursosOffline = async () => {
    if (data.length === 0) {
      return;
    }

    const nuevasImagenes = {};
    const nuevosAudios = {};

    for (const sitio of data) {
      const idSitio = Number(sitio.id_sitio);

      if (!sitiosOffline.includes(idSitio)) {
        continue;
      }

      try {
        const imagen = await obtenerRecursoOffline(idSitio, "imagen");

        if (imagen?.blob) {
          nuevasImagenes[idSitio] = URL.createObjectURL(imagen.blob);
        }
      } catch (error) {
        console.warn(
          `No se pudo cargar la imagen offline del sitio ${idSitio}:`,
          error,
        );
      }

      try {
        const audio = await obtenerRecursoOffline(idSitio, "audioguia");

        if (audio?.blob) {
          nuevosAudios[idSitio] = URL.createObjectURL(audio.blob);
        }
      } catch (error) {
        console.warn(
          `No se pudo cargar el audio offline del sitio ${idSitio}:`,
          error,
        );
      }
    }

    setImagenesOffline(nuevasImagenes);

    setAudiosOffline(nuevosAudios);
  };

  // =========================================
  // FAVORITOS
  // =========================================

  const cargarFavoritos = async () => {
    const token = obtenerToken();

    if (!token) {
      setFavoritos([]);
      return;
    }

    // Los favoritos dependen de la API.

    if (!navigator.onLine) {
      setFavoritos([]);
      return;
    }

    try {
      setCargandoFavoritos(true);

      const response = await axios.get(`${API_URL}/favoritos`, {
        headers: obtenerHeadersAuth(),
      });

      setFavoritos(response.data?.sitios || []);
    } catch (error) {
      console.error("Error cargando favoritos:", error);

      if (error.response?.status === 401) {
        sessionStorage.removeItem("token");

        sessionStorage.removeItem("usuario");
      }

      setFavoritos([]);
    } finally {
      setCargandoFavoritos(false);
    }
  };

  const esFavorito = (idSitio) => {
    return favoritos.some(
      (favorito) => Number(favorito.id_sitio) === Number(idSitio),
    );
  };

  const manejarFavorito = async (e, idSitio) => {
    e.preventDefault();
    e.stopPropagation();

    const token = obtenerToken();

    if (!token) {
      alert("Debes iniciar sesión para guardar sitios en favoritos.");

      navigate("/iniciar-sesion");

      return;
    }

    if (!navigator.onLine) {
      alert("Los favoritos necesitan conexión a internet.");

      return;
    }

    if (procesandoFavorito === idSitio) {
      return;
    }

    try {
      setProcesandoFavorito(idSitio);

      const favoritoActual = esFavorito(idSitio);

      if (favoritoActual) {
        await axios.delete(`${API_URL}/favoritos/${idSitio}`, {
          headers: obtenerHeadersAuth(),
        });

        setFavoritos((favoritosActuales) =>
          favoritosActuales.filter(
            (favorito) => Number(favorito.id_sitio) !== Number(idSitio),
          ),
        );
      } else {
        const response = await axios.post(
          `${API_URL}/favoritos`,
          {
            id_sitio: idSitio,
          },
          {
            headers: {
              "Content-Type": "application/json",
              ...obtenerHeadersAuth(),
            },
          },
        );

        if (response.data?.favorito) {
          setFavoritos((favoritosActuales) => [
            ...favoritosActuales,
            {
              ...response.data.favorito,
              id_sitio: Number(idSitio),
            },
          ]);
        } else {
          await cargarFavoritos();
        }
      }
    } catch (error) {
      console.error("ERROR MODIFICANDO FAVORITO:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        alert(
          "Tu sesión no es válida o no tienes permisos para usar favoritos.",
        );
      } else {
        alert(
          error.response?.data?.details ||
            error.response?.data?.error ||
            error.response?.data?.message ||
            "No se pudo modificar el favorito.",
        );
      }
    } finally {
      setProcesandoFavorito(null);
    }
  };

  // =========================================
  // DESCARGAR SITIO OFFLINE
  // =========================================

  const descargarSitioOffline = async (sitio) => {
    if (!navigator.onLine) {
      alert("Necesitas conexión a internet para descargar este sitio.");

      return;
    }

    if (descargandoSitio === sitio.id_sitio) {
      return;
    }

    try {
      setDescargandoSitio(sitio.id_sitio);

      setProgresoDescarga({
        tipo: "Iniciando descarga...",
        porcentaje: 0,
      });

      // 1. Guardar información

      await guardarSitiosOffline([sitio]);

      // 2. Descargar imagen

      if (sitio.imagen_url) {
        setProgresoDescarga({
          tipo: "Descargando imagen...",
          porcentaje: 15,
        });

        try {
          const respuestaImagen = await fetch(sitio.imagen_url);

          if (!respuestaImagen.ok) {
            throw new Error(`Error HTTP ${respuestaImagen.status}`);
          }

          const imagenBlob = await respuestaImagen.blob();

          await guardarRecursoOffline(sitio.id_sitio, "imagen", imagenBlob);
        } catch (errorImagen) {
          console.warn("No se pudo descargar la imagen:", errorImagen);
        }
      }

      // 3. Descargar audioguía

      if (sitio.audioguia_url) {
        setProgresoDescarga({
          tipo: "Descargando audioguía...",
          porcentaje: 30,
        });

        try {
          const respuestaAudio = await fetch(sitio.audioguia_url);

          if (!respuestaAudio.ok) {
            throw new Error(`Error HTTP ${respuestaAudio.status}`);
          }

          const audioBlob = await respuestaAudio.blob();

          await guardarRecursoOffline(sitio.id_sitio, "audioguia", audioBlob);
        } catch (errorAudio) {
          console.warn("No se pudo descargar la audioguía:", errorAudio);
        }
      }

      // 4. Descargar mapa

      if (sitio.latitud !== undefined && sitio.longitud !== undefined) {
        setProgresoDescarga({
          tipo: "Descargando mapa...",
          porcentaje: 40,
        });

        const resultadoMapa = await descargarMapaSitio({
          latitud: sitio.latitud,
          longitud: sitio.longitud,
          zoom: 16,
          radio: 2,

          onProgress: ({ porcentaje }) => {
            const porcentajeGeneral = 40 + Math.round(porcentaje * 0.5);

            setProgresoDescarga({
              tipo: "Descargando mapa...",
              porcentaje: porcentajeGeneral,
            });
          },
        });

        console.log("Resultado descarga mapa:", resultadoMapa);
      }

      // 5. Marcar sitio

      setProgresoDescarga({
        tipo: "Guardando sitio...",
        porcentaje: 95,
      });

      await marcarSitioDescargado(sitio.id_sitio);

      // 6. Actualizar estado

      setSitiosOffline((actuales) => {
        const id = Number(sitio.id_sitio);

        if (actuales.includes(id)) {
          return actuales;
        }

        return [...actuales, id];
      });

      // 7. Cargar recursos

      await cargarRecursosOffline();

      setProgresoDescarga({
        tipo: "Descarga completada",
        porcentaje: 100,
      });

      alert(`"${sitio.titulo_es}" quedó disponible para usar sin conexión.`);
    } catch (error) {
      console.error("Error descargando sitio:", error);

      alert("No se pudo completar la descarga offline de este sitio.");
    } finally {
      setTimeout(() => {
        setProgresoDescarga(null);
      }, 500);

      setDescargandoSitio(null);
    }
  };

  // =========================================
  // BÚSQUEDA
  // =========================================

  const sitiosFiltrados = data.filter((sitio) => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return true;
    }

    return (
      sitio.titulo_es?.toLowerCase().includes(texto) ||
      sitio.titulo_en?.toLowerCase().includes(texto) ||
      sitio.descripcion_es?.toLowerCase().includes(texto) ||
      sitio.descripcion_en?.toLowerCase().includes(texto)
    );
  });

  // =========================================
  // MODAL
  // =========================================

  const abrirModalSitio = (sitio) => {
    setSitioSeleccionado(sitio);
    setModalAbierto(true);
  };

  const cerrarModalSitio = () => {
    setModalAbierto(false);
    setSitioSeleccionado(null);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <main className="sitios-page">
      {/* =====================================
          HERO
      ===================================== */}

      <section
        className="sitios-hero"
        style={{
          backgroundImage: `url(${cerroImg})`,
        }}
      >
        <div className="sitios-hero-overlay">
          <div className="sitios-hero-content">
            <p className="sitios-hero-subtitle">Descubre Arica</p>

            <h1>Lugares turísticos</h1>

            <p>
              Explora los lugares patrimoniales y turísticos que forman parte de
              la historia del desierto.
            </p>

            <div className="sitios-search">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar un lugar..."
              />

              <button
                type="button"
                onClick={() => {
                  const texto = busqueda.trim();

                  if (texto) {
                    navigate(`/sitios?buscar=${encodeURIComponent(texto)}`);
                  } else {
                    navigate("/sitios");
                  }
                }}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          AVISO OFFLINE
      ===================================== */}

      {sinConexion && (
        <section className="sitios-offline-aviso">
          <div>
            <strong>📡 Estás sin conexión</strong>

            <p>
              Mostrando los sitios que tienes guardados para usar sin internet.
            </p>
          </div>
        </section>
      )}

      {/* =====================================
          CONTENIDO
      ===================================== */}

      <section className="sitios-container">
        <div className="sitios-section-header">
          <div>
            <p className="sitios-section-subtitle">Patrimonio</p>

            <h2>
              {busqueda
                ? `Resultados para "${busqueda}"`
                : "Lugares para conocer"}
            </h2>
          </div>
        </div>

        {/* CARGANDO */}

        {cargando && (
          <div className="sitios-mensaje">
            <p>Cargando sitios turísticos...</p>
          </div>
        )}

        {/* ERROR */}

        {!cargando && error && (
          <div className="sitios-mensaje sitios-error">
            <p>{error}</p>

            <button type="button" onClick={cargarSitios}>
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* SIN RESULTADOS */}

        {!cargando && !error && sitiosFiltrados.length === 0 && (
          <div className="sitios-mensaje">
            <p>No encontramos sitios que coincidan con tu búsqueda.</p>
          </div>
        )}

        {/* SITIOS */}

        {!cargando && !error && sitiosFiltrados.length > 0 && (
          <div className="sitios-grid">
            {sitiosFiltrados.map((sitio) => {
              const idSitio = Number(sitio.id_sitio);

              const favorito = esFavorito(idSitio);

              const procesando = procesandoFavorito === idSitio;

              const disponibleOffline = sitiosOffline.includes(idSitio);

              const descargando = descargandoSitio === idSitio;

              const imagenOffline = imagenesOffline[idSitio];

              const audioOffline = audiosOffline[idSitio];

              const imagenMostrar = imagenOffline || sitio.imagen_url;

              const audioMostrar = audioOffline || sitio.audioguia_url;

              return (
                <article className="sitio-card" key={sitio.id_sitio}>
                  {/* IMAGEN */}

                  <div className="sitio-card-image-container">
                    {imagenMostrar ? (
                      <img
                        src={imagenMostrar}
                        alt={sitio.titulo_es}
                        className="sitio-card-image"
                      />
                    ) : (
                      <div className="sitio-card-image-placeholder">
                        Sin imagen
                      </div>
                    )}

                    {/* FAVORITO */}

                    <button
                      type="button"
                      className={`sitio-favorito ${
                        favorito ? "sitio-favorito-activo" : ""
                      }`}
                      onClick={(e) => manejarFavorito(e, idSitio)}
                      disabled={procesando || cargandoFavoritos}
                      aria-label={
                        favorito
                          ? `Quitar ${sitio.titulo_es} de favoritos`
                          : `Agregar ${sitio.titulo_es} a favoritos`
                      }
                      title={
                        favorito ? "Quitar de favoritos" : "Agregar a favoritos"
                      }
                    >
                      {procesando ? "..." : favorito ? "♥" : "♡"}
                    </button>
                  </div>

                  {/* CONTENIDO */}

                  <div className="sitio-card-content">
                    <h3>{sitio.titulo_es}</h3>

                    {sitio.titulo_en && (
                      <p className="sitio-card-title-en">{sitio.titulo_en}</p>
                    )}

                    <p className="sitio-card-description">
                      {sitio.descripcion_es}
                    </p>

                    {/* ESTADO OFFLINE */}

                    {disponibleOffline && (
                      <div className="sitio-offline-disponible">
                        ✓ Disponible sin conexión
                      </div>
                    )}

                    {/* PROGRESO */}

                    {descargando && progresoDescarga && (
                      <div
                        className="sitio-descarga-progreso"
                        style={{
                          marginTop: "10px",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 5px",
                          }}
                        >
                          {progresoDescarga.tipo}
                        </p>

                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            background: "#e1e7df",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${progresoDescarga.porcentaje}%`,
                              height: "100%",
                              background: "#5b8c5a",
                              transition: "width 0.2s ease",
                            }}
                          />
                        </div>

                        <small>{progresoDescarga.porcentaje}%</small>
                      </div>
                    )}

                    <div className="sitio-card-footer">
                      <span className="sitio-card-coordinates">
                        📍 {sitio.latitud}, {sitio.longitud}
                      </span>

                      {/* AUDIO */}

                      {audioMostrar ? (
                        <div className="sitio-card-audio">
                          <audio controls src={audioMostrar} preload="none">
                            Tu navegador no soporta el elemento de audio.
                          </audio>

                          {audioOffline && <small>🎧 Audioguía offline</small>}
                        </div>
                      ) : (
                        <span className="sitio-card-sin-audio">
                          Sin audioguía
                        </span>
                      )}

                      {/* VER LUGAR */}

                      <button
                        type="button"
                        onClick={() => abrirModalSitio(sitio)}
                      >
                        Ver lugar
                      </button>

                      {/* DESCARGAR */}

                      {!disponibleOffline && !sinConexion && (
                        <button
                          type="button"
                          onClick={() => descargarSitioOffline(sitio)}
                          disabled={descargando}
                          className="sitio-boton-offline"
                        >
                          {descargando
                            ? "⏳ Descargando..."
                            : "📥 Descargar offline"}
                        </button>
                      )}

                      {/* RUTA */}

                      <button
                        type="button"
                        onClick={() => setSitioParaRuta(sitio)}
                      >
                        🧭 Cómo llegar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================
          MAPA / RUTA
      ===================================== */}

      {sitioParaRuta && (
        <MapaRuta
          latitud={sitioParaRuta.latitud}
          longitud={sitioParaRuta.longitud}
          titulo={sitioParaRuta.titulo_es}
          audioguiaUrl={sitioParaRuta.audioguia_url}
          idSitio={sitioParaRuta.id_sitio}
          onCerrar={() => setSitioParaRuta(null)}
        />
      )}

      {/* =====================================
          MODAL DETALLE DEL SITIO
      ===================================== */}

      <ModalDetalle
        abierto={modalAbierto}
        onCerrar={cerrarModalSitio}
        tipo="sitio"
        datos={sitioSeleccionado}
      />
    </main>
  );
}
