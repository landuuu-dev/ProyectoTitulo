import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import ModalDetalle from "../componentes-fijos/ModalDetalle";

import "./estilosPages/eventos.css";
import cerroImg from "../../../assets/cerro.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Eventos() {
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);

  const [cargandoFavoritos, setCargandoFavoritos] = useState(false);

  const [procesandoFavorito, setProcesandoFavorito] = useState(null);

  const [error, setError] = useState("");

  // =========================================
  // MODAL
  // =========================================

  const [modalAbierto, setModalAbierto] = useState(false);

  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // =========================================
  // CARGAR EVENTOS
  // =========================================

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    cargarFavoritos();
  }, []);

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
  // CARGAR EVENTOS
  // =========================================

  const cargarEventos = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await axios.get(`${API_URL}/eventos`);

      console.log("TODOS LOS EVENTOS:", response.data);

      const eventosAprobados = response.data.filter((evento) => {
        console.log(
          "Evento:",
          evento.titulo,
          "| estado:",
          evento.estado_moderacion,
        );

        return evento.estado_moderacion === "Aprobado";
      });

      console.log("SOLO APROBADOS:", eventosAprobados);

      setEventos(eventosAprobados);
    } catch (error) {
      console.error("Error cargando eventos:", error);

      setError("No se pudieron cargar los eventos culturales.");
    } finally {
      setCargando(false);
    }
  };

  // =========================================
  // CARGAR FAVORITOS
  // =========================================

  const cargarFavoritos = async () => {
    const token = obtenerToken();

    // Los favoritos requieren autenticación.

    if (!token) {
      setFavoritos([]);
      return;
    }

    try {
      setCargandoFavoritos(true);

      const response = await axios.get(`${API_URL}/favoritos`, {
        headers: obtenerHeadersAuth(),
      });

      setFavoritos(response.data?.eventos || []);
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

  // =========================================
  // FAVORITO
  // =========================================

  const esFavorito = (idEvento) => {
    return favoritos.some(
      (favorito) => Number(favorito.id_evento) === Number(idEvento),
    );
  };

  const manejarFavorito = async (e, idEvento) => {
    e.preventDefault();
    e.stopPropagation();

    const token = obtenerToken();

    if (!token) {
      alert("Debes iniciar sesión para guardar eventos en favoritos.");

      navigate("/iniciar-sesion");

      return;
    }

    if (procesandoFavorito === idEvento) {
      return;
    }

    try {
      setProcesandoFavorito(idEvento);

      const favoritoActual = esFavorito(idEvento);

      if (favoritoActual) {
        // Eliminar evento de favoritos

        await axios.delete(`${API_URL}/favoritos/evento/${idEvento}`, {
          headers: obtenerHeadersAuth(),
        });

        setFavoritos((favoritosActuales) =>
          favoritosActuales.filter(
            (favorito) => Number(favorito.id_evento) !== Number(idEvento),
          ),
        );
      } else {
        // Agregar evento de favoritos

        const response = await axios.post(
          `${API_URL}/favoritos`,
          {
            id_evento: idEvento,
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
              id_evento: Number(idEvento),
            },
          ]);
        } else {
          await cargarFavoritos();
        }
      }
    } catch (error) {
      console.error("Error modificando favorito:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        alert(
          "Tu sesión no es válida o no tienes permisos para usar favoritos.",
        );
      } else {
        alert(
          error.response?.data?.error || "No se pudo modificar el favorito.",
        );
      }
    } finally {
      setProcesandoFavorito(null);
    }
  };

  // =========================================
  // FILTRAR EVENTOS
  // =========================================

  const eventosFiltrados = eventos.filter((evento) => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return true;
    }

    return (
      evento.titulo?.toLowerCase().includes(texto) ||
      evento.descripcion?.toLowerCase().includes(texto) ||
      evento.lugar?.toLowerCase().includes(texto)
    );
  });

  // =========================================
  // FORMATEAR FECHA
  // =========================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Fecha por confirmar";
    }

    const fechaEvento = new Date(fecha);

    if (Number.isNaN(fechaEvento.getTime())) {
      return fecha;
    }

    return fechaEvento.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =========================================
  // FORMATEAR HORA
  // =========================================

  const formatearHora = (fecha) => {
    if (!fecha) {
      return "";
    }

    const fechaEvento = new Date(fecha);

    if (Number.isNaN(fechaEvento.getTime())) {
      return "";
    }

    return fechaEvento.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================
  // MODAL
  // =========================================

  const abrirModalEvento = (evento) => {
    setEventoSeleccionado(evento);

    setModalAbierto(true);
  };

  const cerrarModalEvento = () => {
    setModalAbierto(false);
    setEventoSeleccionado(null);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <main className="eventos-page">
      {/* =====================================
          HERO
      ===================================== */}

      <section
        className="eventos-hero"
        style={{
          backgroundImage: `url(${cerroImg})`,
        }}
      >
        <div className="eventos-hero-overlay">
          <div className="eventos-hero-content">
            <p className="eventos-hero-subtitle">Cultura y patrimonio</p>

            <h1>Eventos culturales</h1>

            <p>
              Descubre actividades, encuentros y experiencias culturales que se
              realizan en Arica.
            </p>

            <div className="eventos-search">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar un evento..."
              />

              <button
                type="button"
                onClick={() => {
                  setBusqueda(busqueda.trim());
                }}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          EVENTOS
      ===================================== */}

      <section className="eventos-container">
        <div className="eventos-section-header">
          <div>
            <p className="eventos-section-subtitle">Agenda</p>

            <h2>
              {busqueda ? `Resultados para "${busqueda}"` : "Próximos eventos"}
            </h2>
          </div>
        </div>

        {/* CARGANDO */}

        {cargando && (
          <div className="eventos-mensaje">
            <p>Cargando eventos culturales...</p>
          </div>
        )}

        {/* ERROR */}

        {!cargando && error && (
          <div className="eventos-mensaje eventos-error">
            <p>{error}</p>

            <button type="button" onClick={cargarEventos}>
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* SIN RESULTADOS */}

        {!cargando && !error && eventosFiltrados.length === 0 && (
          <div className="eventos-mensaje">
            <p>No encontramos eventos que coincidan con tu búsqueda.</p>
          </div>
        )}

        {/* EVENTOS */}

        {!cargando && !error && eventosFiltrados.length > 0 && (
          <div className="eventos-grid">
            {eventosFiltrados.map((evento) => {
              const favorito = esFavorito(evento.id_evento);

              const procesando = procesandoFavorito === evento.id_evento;

              return (
                <article className="evento-card" key={evento.id_evento}>
                  {/* IMAGEN */}

                  <div className="evento-card-image-container">
                    {evento.imagen_url ? (
                      <img
                        src={evento.imagen_url}
                        alt={evento.titulo}
                        className="evento-card-image"
                      />
                    ) : (
                      <div className="evento-card-image-placeholder">
                        Sin imagen
                      </div>
                    )}

                    {/* FAVORITO */}

                    <button
                      type="button"
                      className={`evento-favorito ${
                        favorito ? "evento-favorito-activo" : ""
                      }`}
                      onClick={(e) => manejarFavorito(e, evento.id_evento)}
                      disabled={procesando || cargandoFavoritos}
                      aria-label={
                        favorito
                          ? `Quitar ${evento.titulo} de favoritos`
                          : `Agregar ${evento.titulo} a favoritos`
                      }
                      title={
                        favorito ? "Quitar de favoritos" : "Agregar a favoritos"
                      }
                    >
                      {procesando ? "..." : favorito ? "♥" : "♡"}
                    </button>
                  </div>

                  {/* CONTENIDO */}

                  <div className="evento-card-content">
                    <h3>{evento.titulo}</h3>

                    {evento.descripcion && (
                      <p className="evento-card-description">
                        {evento.descripcion}
                      </p>
                    )}

                    <div className="evento-card-info">
                      {evento.fecha_inicio && (
                        <div className="evento-info-item">
                          <span className="evento-info-icon">📅</span>

                          <span>
                            {formatearFecha(evento.fecha_inicio)}

                            {formatearHora(evento.fecha_inicio) && (
                              <>
                                {" · "}
                                {formatearHora(evento.fecha_inicio)}
                              </>
                            )}
                          </span>
                        </div>
                      )}

                      {evento.lugar && (
                        <div className="evento-info-item">
                          <span className="evento-info-icon">📍</span>

                          <span>{evento.lugar}</span>
                        </div>
                      )}
                    </div>

                    {/* VER EVENTO */}

                    <button
                      type="button"
                      className="evento-boton-detalle"
                      onClick={() => abrirModalEvento(evento)}
                    >
                      Ver evento
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================
          MODAL DETALLE DEL EVENTO
      ===================================== */}

      <ModalDetalle
        abierto={modalAbierto}
        onCerrar={cerrarModalEvento}
        tipo="evento"
        datos={eventoSeleccionado}
      />
    </main>
  );
}
