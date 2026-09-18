import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./estilosPages/home.css";

import cerroImg from "../../../assets/cerro.png";
import mapaImg from "../../../assets/mapa.jpeg";

import ModalDetalle from "../componentes-fijos/ModalDetalle";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [evento, setEvento] = useState(null);
  const [sitios, setSitios] = useState([]);

  // =========================================
  // ESTADOS DEL MODAL
  // =========================================

  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleModal, setDetalleModal] = useState(null);

  // =========================================
  // CARGAR EVENTO Y SITIOS
  // =========================================

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await axios.get(`${API_URL}/eventos`);

        // Filtrar solamente eventos aprobados
        const eventosAprobados = response.data.filter(
          (evento) => evento.estado_moderacion === "Aprobado",
        );

        // Mostrar solamente 1 evento aprobado
        if (eventosAprobados.length > 0) {
          setEvento(eventosAprobados[0]);
        } else {
          setEvento(null);
        }
      } catch (error) {
        console.error("Error al traer evento:", error);
      }
    };

    const fetchSitios = async () => {
      try {
        const response = await axios.get(`${API_URL}/sitios`);

        // Mostrar solamente los 3 primeros sitios
        setSitios(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error al traer sitios:", error);
      }
    };

    fetchEvento();
    fetchSitios();
  }, []);

  // =========================================
  // BUSCADOR
  // =========================================

  const handleBuscar = (e) => {
    e.preventDefault();

    const termino = busqueda.trim();

    navigate(`/sitios?buscar=${encodeURIComponent(termino)}`);
  };

  // =========================================
  // FORMATEAR FECHA
  // =========================================

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =========================================
  // ABRIR MODAL
  // =========================================

  const abrirModal = (tipo, datos) => {
    setDetalleModal({
      tipo,
      datos,
    });

    setModalAbierto(true);
  };

  // =========================================
  // CERRAR MODAL
  // =========================================

  const cerrarModal = () => {
    setModalAbierto(false);
    setDetalleModal(null);
  };

  return (
    <main className="home">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">
        <div className="hero__imagen">
          <img src={cerroImg} alt="Paisaje del desierto" />
        </div>

        <div className="hero__contenido">
          <div className="hero__texto">
            <h1>
              Tu ruta comienza hoy,
              <br />
              descubre las maravillas del desierto
            </h1>

            <p>
              Explora lugares increíbles, eventos culturales y los rincones más
              sorprendentes de la región.
            </p>

            <form className="hero__buscador" onSubmit={handleBuscar}>
              <input
                type="text"
                placeholder="¿Qué lugar quieres descubrir?"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <button type="submit" aria-label="Buscar">
                🔍
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          AGENDA CULTURAL
      ===================================================== */}

      <section className="agenda">
        <div className="section__header">
          <div className="agenda__texto">
            <h2>Agenda cultural</h2>

            <p>
              Encuentra los mejores eventos de la región con información para
              que puedas disfrutar cada experiencia.
            </p>
          </div>

          {evento && (
            <article className="sitio__card evento__card">
              {/* IMAGEN DEL EVENTO */}

              <div className="sitio__imagen">
                {evento.imagen_url ? (
                  <img src={evento.imagen_url} alt={evento.titulo} />
                ) : (
                  <div className="sitio__placeholder">Sin imagen</div>
                )}
              </div>

              {/* CONTENIDO DEL EVENTO */}

              <div className="sitio__contenido">
                {evento.nombre_categoria && (
                  <span className="sitio__categoria">
                    {evento.nombre_categoria}
                  </span>
                )}

                <h3>{evento.titulo}</h3>

                {evento.descripcion && <p>{evento.descripcion}</p>}

                <div className="evento__info">
                  <span>📍 {evento.lugar}</span>

                  <span>📅 {formatearFecha(evento.fecha_inicio)}</span>
                </div>

                <button
                  className="sitio__boton"
                  type="button"
                  onClick={() => abrirModal("evento", evento)}
                >
                  Ver evento
                </button>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* =====================================================
          LUGARES TURÍSTICOS
      ===================================================== */}

      <section className="lugares">
        <div className="section__header">
          <h2>Lugares turísticos de la región</h2>

          <p>
            Descubre paisajes, destinos y lugares únicos que no puedes dejar de
            visitar.
          </p>
        </div>

        <div className="sitios__grid">
          {sitios.length > 0 ? (
            sitios.map((sitio) => (
              <article className="sitio__card" key={sitio.id_sitio}>
                {/* =================================================
                    IMAGEN DEL SITIO
                ================================================= */}

                {sitio.imagen_url ? (
                  <img src={sitio.imagen_url} alt={sitio.titulo_es} />
                ) : (
                  <div className="sitio__imagen-placeholder">
                    <span>🏜️</span>
                  </div>
                )}

                {/* =================================================
                    CONTENIDO
                ================================================= */}

                <div className="sitio__contenido">
                  <h3>{sitio.titulo_es}</h3>

                  {sitio.descripcion_es && <p>{sitio.descripcion_es}</p>}

                  {sitio.latitud && sitio.longitud && (
                    <span className="sitio__ubicacion">📍 Arica</span>
                  )}

                  <button
                    type="button"
                    onClick={() => abrirModal("sitio", sitio)}
                  >
                    Ver lugar
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="mensaje-vacio">
              No hay lugares disponibles por el momento.
            </p>
          )}
        </div>
      </section>

      {/* =====================================================
          NAVEGACIÓN SIN CONEXIÓN
      ===================================================== */}

      <section className="offline">
        <div className="offline__contenido">
          <div className="offline__texto">
            <h2>Llega a tu destino sin conexión</h2>

            <p>
              Podrás llegar a los lugares turísticos más remotos sin conexión.
              Descarga lo que necesites y llega sin problemas. Contamos con
              mapas, audioguías y fichas informativas.
            </p>

            <button type="button" onClick={() => navigate("/sitios")}>
              Explorar mapas
            </button>
          </div>

          {/* =================================================
              IMAGEN DEL MAPA
          ================================================= */}

          <div className="offline__mapa">
            <img src={mapaImg} alt="Mapa para navegación sin conexión" />
          </div>
        </div>
      </section>

      {/* =====================================================
          MODAL REUTILIZABLE
      ===================================================== */}

      {modalAbierto && detalleModal && (
        <ModalDetalle
          abierto={modalAbierto}
          onCerrar={cerrarModal}
          tipo={detalleModal.tipo}
          datos={detalleModal.datos}
        />
      )}
    </main>
  );
}
