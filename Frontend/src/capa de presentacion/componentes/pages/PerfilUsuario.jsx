import React, { useEffect, useState } from "react";
import axios from "axios";
import ModalDetalle from "../componentes-fijos/ModalDetalle";

import {
  guardarSitiosOffline,
  guardarRecursoOffline,
  marcarSitioDescargado,
  obtenerSitiosDescargados,
  descargarMapaSitio,
} from "../../../capa de persistencia local/almacenamientoOffline";

import "./estilosPages/perfilUsuario.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);

  const [favoritosSitios, setFavoritosSitios] = useState([]);
  const [favoritosEventos, setFavoritosEventos] = useState([]);

  const [cargandoFavoritos, setCargandoFavoritos] = useState(true);
  const [errorFavoritos, setErrorFavoritos] = useState("");

  const [eliminando, setEliminando] = useState(null);

  // =========================================================
  // MODAL SITIO
  // =========================================================

  const [modalAbierto, setModalAbierto] = useState(false);
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [cargandoSitio, setCargandoSitio] = useState(false);

  // =========================================================
  // OFFLINE
  // =========================================================

  const [sitiosOffline, setSitiosOffline] = useState([]);
  const [descargandoSitio, setDescargandoSitio] = useState(null);
  const [progresoDescarga, setProgresoDescarga] = useState(null);

  // =========================================================
  // CARGAR USUARIO
  // =========================================================

  useEffect(() => {
    const cargarUsuario = () => {
      const usuarioGuardado = sessionStorage.getItem("usuario");

      if (!usuarioGuardado) {
        setUsuario(null);
        return;
      }

      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        setUsuario(null);
      }
    };

    cargarUsuario();

    window.addEventListener("authChanged", cargarUsuario);

    return () => {
      window.removeEventListener("authChanged", cargarUsuario);
    };
  }, []);

  // =========================================================
  // CARGAR FAVORITOS
  // =========================================================

  useEffect(() => {
    cargarFavoritos();
  }, []);

  // =========================================================
  // CARGAR SITIOS DESCARGADOS OFFLINE
  // =========================================================

  useEffect(() => {
    cargarSitiosOffline();
  }, []);

  const cargarSitiosOffline = async () => {
    try {
      const descargas = await obtenerSitiosDescargados();

      const ids = descargas.map((sitio) => Number(sitio.id_sitio));

      setSitiosOffline(ids);
    } catch (error) {
      console.error("Error obteniendo sitios descargados:", error);
    }
  };

  // =========================================================
  // TOKEN
  // =========================================================

  const obtenerToken = () => {
    return sessionStorage.getItem("token");
  };

  // =========================================================
  // CARGAR FAVORITOS
  // =========================================================

  const cargarFavoritos = async () => {
    const token = obtenerToken();

    if (!token) {
      setFavoritosSitios([]);
      setFavoritosEventos([]);
      setCargandoFavoritos(false);
      return;
    }

    try {
      setCargandoFavoritos(true);
      setErrorFavoritos("");

      const response = await axios.get(`${API_URL}/favoritos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavoritosSitios(response.data?.sitios || []);
      setFavoritosEventos(response.data?.eventos || []);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);

      if (error.response?.status === 401) {
        setErrorFavoritos("Tu sesión ha expirado. Inicia sesión nuevamente.");
      } else {
        setErrorFavoritos("No se pudieron cargar tus favoritos.");
      }

      setFavoritosSitios([]);
      setFavoritosEventos([]);
    } finally {
      setCargandoFavoritos(false);
    }
  };

  // =========================================================
  // ELIMINAR SITIO FAVORITO
  // =========================================================

  const eliminarSitioFavorito = async (idSitio) => {
    const token = obtenerToken();

    if (!token) {
      return;
    }

    try {
      setEliminando(`sitio-${idSitio}`);

      await axios.delete(`${API_URL}/favoritos/sitios/${idSitio}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavoritosSitios((favoritosActuales) =>
        favoritosActuales.filter(
          (favorito) => Number(favorito.id_sitio) !== Number(idSitio),
        ),
      );
    } catch (error) {
      console.error("Error al eliminar sitio de favoritos:", error);

      alert(
        error.response?.data?.message ||
          "No se pudo eliminar el sitio de favoritos.",
      );
    } finally {
      setEliminando(null);
    }
  };

  // =========================================================
  // ELIMINAR EVENTO FAVORITO
  // =========================================================

  const eliminarEventoFavorito = async (idEvento) => {
    const token = obtenerToken();

    if (!token) {
      return;
    }

    try {
      setEliminando(`evento-${idEvento}`);

      await axios.delete(`${API_URL}/favoritos/eventos/${idEvento}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavoritosEventos((favoritosActuales) =>
        favoritosActuales.filter(
          (favorito) => Number(favorito.id_evento) !== Number(idEvento),
        ),
      );
    } catch (error) {
      console.error("Error al eliminar evento de favoritos:", error);

      alert(
        error.response?.data?.message ||
          "No se pudo eliminar el evento de favoritos.",
      );
    } finally {
      setEliminando(null);
    }
  };

  // =========================================================
  // OBTENER SITIO COMPLETO DESDE /SITIOS
  // =========================================================

  const obtenerSitioCompleto = async (idSitio) => {
    const response = await axios.get(`${API_URL}/sitios`);

    const sitios = response.data || [];

    const sitioCompleto = sitios.find(
      (item) => Number(item.id_sitio) === Number(idSitio),
    );

    if (!sitioCompleto) {
      throw new Error("No se encontró el sitio en /sitios.");
    }

    return sitioCompleto;
  };

  // =========================================================
  // VER LUGAR
  // =========================================================

  const abrirLugarFavorito = async (sitio) => {
    try {
      setCargandoSitio(true);

      const sitioCompleto = await obtenerSitioCompleto(sitio.id_sitio);

      console.log("Sitio completo obtenido desde /sitios:", sitioCompleto);

      console.log("Audioguía:", sitioCompleto.audioguia_url);

      setSitioSeleccionado(sitioCompleto);
      setModalAbierto(true);
    } catch (error) {
      console.error("Error obteniendo información del sitio:", error);

      alert("No se pudo cargar la información completa del lugar.");
    } finally {
      setCargandoSitio(false);
    }
  };

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  const cerrarModalSitio = () => {
    setModalAbierto(false);
    setSitioSeleccionado(null);
  };

  // =========================================================
  // DESCARGAR SITIO OFFLINE
  // =========================================================

  const descargarSitioOffline = async (sitio) => {
    const idSitio = Number(sitio.id_sitio);

    if (!navigator.onLine) {
      alert("Necesitas conexión a internet para descargar este sitio.");

      return;
    }

    if (descargandoSitio === idSitio) {
      return;
    }

    if (sitiosOffline.includes(idSitio)) {
      return;
    }

    try {
      setDescargandoSitio(idSitio);

      setProgresoDescarga({
        tipo: "Obteniendo información del sitio...",
        porcentaje: 5,
      });

      // =====================================================
      // 1. OBTENER INFORMACIÓN COMPLETA DESDE /SITIOS
      // =====================================================

      const sitioCompleto = await obtenerSitioCompleto(idSitio);

      // =====================================================
      // 2. GUARDAR INFORMACIÓN DEL SITIO
      // =====================================================

      setProgresoDescarga({
        tipo: "Guardando información...",
        porcentaje: 10,
      });

      await guardarSitiosOffline([sitioCompleto]);

      // =====================================================
      // 3. DESCARGAR IMAGEN
      // =====================================================

      if (sitioCompleto.imagen_url) {
        setProgresoDescarga({
          tipo: "Descargando imagen...",
          porcentaje: 15,
        });

        try {
          const respuestaImagen = await fetch(sitioCompleto.imagen_url);

          if (!respuestaImagen.ok) {
            throw new Error(`Error HTTP ${respuestaImagen.status}`);
          }

          const imagenBlob = await respuestaImagen.blob();

          await guardarRecursoOffline(idSitio, "imagen", imagenBlob);
        } catch (errorImagen) {
          console.warn("No se pudo descargar la imagen:", errorImagen);
        }
      }

      // =====================================================
      // 4. DESCARGAR AUDIO SI EXISTE
      // =====================================================

      if (sitioCompleto.audioguia_url) {
        setProgresoDescarga({
          tipo: "Descargando audioguía...",
          porcentaje: 30,
        });

        try {
          const respuestaAudio = await fetch(sitioCompleto.audioguia_url);

          if (!respuestaAudio.ok) {
            throw new Error(`Error HTTP ${respuestaAudio.status}`);
          }

          const audioBlob = await respuestaAudio.blob();

          await guardarRecursoOffline(idSitio, "audioguia", audioBlob);
        } catch (errorAudio) {
          console.warn("No se pudo descargar la audioguía:", errorAudio);
        }
      }

      // =====================================================
      // 5. DESCARGAR MAPA
      // =====================================================

      if (
        sitioCompleto.latitud !== undefined &&
        sitioCompleto.longitud !== undefined
      ) {
        setProgresoDescarga({
          tipo: "Descargando mapa...",
          porcentaje: 40,
        });

        const resultadoMapa = await descargarMapaSitio({
          latitud: sitioCompleto.latitud,
          longitud: sitioCompleto.longitud,
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

      // =====================================================
      // 6. MARCAR COMO DESCARGADO
      // =====================================================

      setProgresoDescarga({
        tipo: "Guardando sitio...",
        porcentaje: 95,
      });

      await marcarSitioDescargado(idSitio);

      // =====================================================
      // 7. ACTUALIZAR ESTADO
      // =====================================================

      setSitiosOffline((actuales) => {
        if (actuales.includes(idSitio)) {
          return actuales;
        }

        return [...actuales, idSitio];
      });

      setProgresoDescarga({
        tipo: "Descarga completada",
        porcentaje: 100,
      });

      alert(
        `"${sitioCompleto.titulo_es}" quedó disponible para usar sin conexión.`,
      );
    } catch (error) {
      console.error("Error descargando sitio offline:", error);

      alert("No se pudo completar la descarga offline de este sitio.");
    } finally {
      setTimeout(() => {
        setProgresoDescarga(null);
      }, 700);

      setDescargandoSitio(null);
    }
  };

  // =========================================================
  // FORMATEAR FECHAS
  // =========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Fecha no disponible";
    }

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return "Fecha no disponible";
    }

    return fechaFormateada.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) {
      return "Fecha no disponible";
    }

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return "Fecha no disponible";
    }

    return fechaFormateada.toLocaleString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // SIN SESIÓN
  // =========================================================

  if (!usuario) {
    return (
      <main className="perfil-root">
        <section className="perfil-card">
          <h1>No hay una sesión iniciada</h1>

          <p>
            Inicia sesión para poder visualizar tu información y tus favoritos.
          </p>
        </section>
      </main>
    );
  }

  const fechaRegistro = usuario.fecha_registro
    ? formatearFecha(usuario.fecha_registro)
    : "No disponible";

  const totalFavoritos = favoritosSitios.length + favoritosEventos.length;

  return (
    <main className="perfil-root">
      <section className="perfil-card">
        {/* =====================================================
            INFORMACIÓN DEL USUARIO
        ====================================================== */}

        <div className="perfil-header">
          <div className="perfil-avatar">
            {usuario.nombre?.charAt(0).toUpperCase() || "U"}
          </div>

          <div>
            <p className="perfil-subtitulo">Mi cuenta</p>

            <h1>{usuario.nombre || "Usuario"}</h1>

            <span className="perfil-rol">
              {usuario.nombre_rol || "Usuario"}
            </span>
          </div>
        </div>

        <div className="perfil-separador"></div>

        {/* =====================================================
            INFORMACIÓN PERSONAL
        ====================================================== */}

        <section className="perfil-informacion">
          <h2>Información personal</h2>

          <div className="perfil-datos">
            <div className="perfil-dato">
              <span className="dato-label">ID de usuario</span>

              <span className="dato-valor">
                {usuario.id_usuario ?? "No disponible"}
              </span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Nombre</span>

              <span className="dato-valor">
                {usuario.nombre || "No disponible"}
              </span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Correo electrónico</span>

              <span className="dato-valor">
                {usuario.email || "No disponible"}
              </span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Fecha de registro</span>

              <span className="dato-valor">{fechaRegistro}</span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Tipo de cuenta</span>

              <span className="dato-valor">
                {usuario.nombre_rol || "No disponible"}
              </span>
            </div>
          </div>
        </section>

        <div className="perfil-separador"></div>

        {/* =====================================================
            FAVORITOS
        ====================================================== */}

        <section className="perfil-favoritos">
          <div className="perfil-favoritos-header">
            <div>
              <p className="perfil-subtitulo">Mis favoritos</p>

              <h2>Lugares y eventos guardados</h2>
            </div>

            <span className="perfil-favoritos-contador">{totalFavoritos}</span>
          </div>

          {/* ===================================================
              CARGANDO
          =================================================== */}

          {cargandoFavoritos && (
            <div className="favoritos-mensaje">
              <p>Cargando tus favoritos...</p>
            </div>
          )}

          {/* ===================================================
              ERROR
          =================================================== */}

          {!cargandoFavoritos && errorFavoritos && (
            <div className="favoritos-mensaje favoritos-error">
              <p>{errorFavoritos}</p>

              <button type="button" onClick={cargarFavoritos}>
                Intentar nuevamente
              </button>
            </div>
          )}

          {/* ===================================================
              FAVORITOS CARGADOS
          =================================================== */}

          {!cargandoFavoritos && !errorFavoritos && (
            <>
              {/* =================================================
                    SITIOS FAVORITOS
              ================================================== */}

              <div className="favoritos-seccion">
                <div className="favoritos-seccion-titulo">
                  <h3>📍 Sitios turísticos</h3>

                  <span>{favoritosSitios.length}</span>
                </div>

                {favoritosSitios.length === 0 ? (
                  <div className="favoritos-vacio">
                    <span className="favoritos-vacio-icon">♡</span>

                    <p>Todavía no tienes sitios turísticos favoritos.</p>

                    <small>
                      Pulsa el corazón en un lugar que quieras guardar.
                    </small>
                  </div>
                ) : (
                  <div className="favoritos-lista">
                    {favoritosSitios.map((sitio) => {
                      const idSitio = Number(sitio.id_sitio);

                      const disponibleOffline = sitiosOffline.includes(idSitio);

                      const descargando = descargandoSitio === idSitio;

                      return (
                        <article
                          className="favorito-item"
                          key={sitio.id_favorito}
                        >
                          {/* IMAGEN */}

                          <div className="favorito-imagen">
                            {sitio.imagen_url ? (
                              <img
                                src={sitio.imagen_url}
                                alt={sitio.titulo_es}
                              />
                            ) : (
                              <div className="favorito-imagen-placeholder">
                                📍
                              </div>
                            )}
                          </div>

                          {/* CONTENIDO */}

                          <div className="favorito-contenido">
                            <h4>{sitio.titulo_es}</h4>

                            <p className="favorito-ubicacion">
                              📍 {sitio.latitud}, {sitio.longitud}
                            </p>

                            <small>
                              Guardado el {formatearFecha(sitio.fecha_guardado)}
                            </small>

                            {/* ESTADO OFFLINE */}

                            {disponibleOffline && (
                              <div
                                className="favorito-offline"
                                style={{
                                  marginTop: "8px",
                                }}
                              >
                                ✓ Disponible sin conexión
                              </div>
                            )}

                            {/* PROGRESO */}

                            {descargando && progresoDescarga && (
                              <div
                                className="favorito-descarga-progreso"
                                style={{
                                  marginTop: "8px",
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
                                    height: "6px",
                                    background: "#e5e5e5",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${progresoDescarga.porcentaje}%`,
                                      height: "100%",
                                      background: "#5f8d62",
                                      transition: "width 0.2s ease",
                                    }}
                                  />
                                </div>

                                <small>{progresoDescarga.porcentaje}%</small>
                              </div>
                            )}
                          </div>

                          {/* ACCIONES */}

                          <div
                            className="favorito-acciones"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              alignItems: "stretch",
                            }}
                          >
                            {/* VER LUGAR */}

                            <button
                              type="button"
                              className="favorito-ver"
                              onClick={() => abrirLugarFavorito(sitio)}
                              disabled={cargandoSitio}
                              title="Ver lugar"
                              aria-label="Ver lugar"
                            >
                              {cargandoSitio ? "..." : "👁️ Ver lugar"}
                            </button>

                            {/* DESCARGAR OFFLINE */}

                            {!disponibleOffline && navigator.onLine && (
                              <button
                                type="button"
                                className="favorito-offline-boton"
                                onClick={() => descargarSitioOffline(sitio)}
                                disabled={descargando}
                                title="Descargar para usar sin conexión"
                                aria-label="Descargar para usar sin conexión"
                              >
                                {descargando
                                  ? "⏳ Descargando..."
                                  : "📥 Descargar offline"}
                              </button>
                            )}

                            {/* YA DESCARGADO */}

                            {disponibleOffline && (
                              <div
                                className="favorito-offline-disponible"
                                title="Este lugar está disponible sin conexión"
                              >
                                ✓ Offline
                              </div>
                            )}

                            {/* ELIMINAR */}

                            <button
                              type="button"
                              className="favorito-eliminar"
                              onClick={() =>
                                eliminarSitioFavorito(sitio.id_sitio)
                              }
                              disabled={
                                eliminando === `sitio-${sitio.id_sitio}`
                              }
                              title="Quitar de favoritos"
                              aria-label="Quitar de favoritos"
                            >
                              {eliminando === `sitio-${sitio.id_sitio}`
                                ? "..."
                                : "♥"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* =================================================
                    EVENTOS FAVORITOS
              ================================================== */}

              <div className="favoritos-seccion">
                <div className="favoritos-seccion-titulo">
                  <h3>📅 Eventos culturales</h3>

                  <span>{favoritosEventos.length}</span>
                </div>

                {favoritosEventos.length === 0 ? (
                  <div className="favoritos-vacio">
                    <span className="favoritos-vacio-icon">♡</span>

                    <p>Todavía no tienes eventos culturales favoritos.</p>

                    <small>
                      Pulsa el corazón en un evento que quieras guardar.
                    </small>
                  </div>
                ) : (
                  <div className="favoritos-lista">
                    {favoritosEventos.map((evento) => (
                      <article
                        className="favorito-item favorito-evento"
                        key={evento.id_favorito}
                      >
                        <div className="favorito-evento-icon">📅</div>

                        <div className="favorito-contenido">
                          <h4>{evento.titulo}</h4>

                          {evento.descripcion && (
                            <p className="favorito-descripcion">
                              {evento.descripcion}
                            </p>
                          )}

                          <p className="favorito-ubicacion">
                            📍 {evento.lugar || "Lugar no disponible"}
                          </p>

                          <p className="favorito-fecha-evento">
                            🗓️ {formatearFechaHora(evento.fecha_inicio)}
                          </p>

                          <small>
                            Guardado el {formatearFecha(evento.fecha_guardado)}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="favorito-eliminar"
                          onClick={() =>
                            eliminarEventoFavorito(evento.id_evento)
                          }
                          disabled={eliminando === `evento-${evento.id_evento}`}
                          title="Quitar de favoritos"
                          aria-label="Quitar de favoritos"
                        >
                          {eliminando === `evento-${evento.id_evento}`
                            ? "..."
                            : "♥"}
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* =================================================
                    SIN FAVORITOS
              ================================================== */}

              {totalFavoritos === 0 && (
                <div className="favoritos-todos-vacios">
                  <div className="favoritos-todos-icon">♡</div>

                  <h3>Aún no tienes favoritos</h3>

                  <p>
                    Explora los sitios turísticos y eventos culturales para
                    guardar tus favoritos.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </section>

      {/* =====================================================
          MODAL DETALLE DEL SITIO
      ====================================================== */}

      <ModalDetalle
        abierto={modalAbierto}
        onCerrar={cerrarModalSitio}
        tipo="sitio"
        datos={sitioSeleccionado}
      />
    </main>
  );
}
