import React, { useCallback, useEffect, useState } from "react";
import "./estilosPages/panelAdministracion.css";

const API_URL = import.meta.env.VITE_API_URL;

const ESTADOS_MODERACION = ["Pendiente", "Aprobado", "Rechazado"];

const FUENTES_ORIGEN = ["Manual", "Importado", "Scraper_Muni"];

const SITIO_VACIO = {
  titulo_es: "",
  titulo_en: "",
  descripcion_es: "",
  descripcion_en: "",
  latitud: "",
  longitud: "",
  imagen_url: "",
  audioguia_url: "",
};

const EVENTO_VACIO = {
  titulo: "",
  descripcion: "",
  lugar: "",
  fecha_inicio: "",
  imagen_url: "",
  estado_moderacion: "Pendiente",
  fuente_origen: "Manual",
  id_categoria: "",
};

export default function PanelAdministracion() {
  const [vista, setVista] = useState("sitios");

  const [sitios, setSitios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [actualizandoScraper, setActualizandoScraper] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [formAbierto, setFormAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEnEdicion, setIdEnEdicion] = useState(null);

  const [formSitio, setFormSitio] = useState(SITIO_VACIO);
  const [formEvento, setFormEvento] = useState(EVENTO_VACIO);

  const [confirmarId, setConfirmarId] = useState(null);

  // =========================================================
  // OBTENER TOKEN
  // =========================================================

  const obtenerToken = () => {
    return sessionStorage.getItem("token");
  };

  // =========================================================
  // HEADERS DE AUTENTICACIÓN
  // =========================================================

  const authHeaders = () => {
    const token = obtenerToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // =========================================================
  // CARGAR SITIOS
  // =========================================================

  const cargarSitios = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/sitios`);

      if (!res.ok) {
        throw new Error("No se pudo obtener la lista de sitios.");
      }

      const data = await res.json();

      setSitios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar los sitios.");
    } finally {
      setCargando(false);
    }
  }, []);

  // =========================================================
  // CARGAR EVENTOS
  // =========================================================

  const cargarEventos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/eventos`);

      if (!res.ok) {
        throw new Error("No se pudo obtener la lista de eventos.");
      }

      const data = await res.json();

      setEventos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar los eventos.");
    } finally {
      setCargando(false);
    }
  }, []);

  // =========================================================
  // ACTUALIZAR SCRAPER MUNICIPALIDAD
  // =========================================================

  const actualizarScraper = async () => {
    try {
      setActualizandoScraper(true);
      setError("");
      setMensaje("");

      const token = obtenerToken();

      if (!token) {
        throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
      }

      const res = await fetch(`${API_URL}/scraper/eventos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || "No se pudo actualizar el scraper.");
      }

      setMensaje(
        `Scraper actualizado correctamente. ` +
          `Encontrados: ${data.encontrados ?? 0} | ` +
          `Nuevos: ${data.insertados ?? 0} | ` +
          `Duplicados: ${data.duplicados ?? 0} | ` +
          `Errores: ${data.errores ?? 0}`,
      );

      // Recargar la tabla de eventos después del scraping
      await cargarEventos();
    } catch (e) {
      console.error("Error actualizando scraper:", e);

      setError(e.message || "No se pudo actualizar el scraper.");
    } finally {
      setActualizandoScraper(false);
    }
  };

  // =========================================================
  // CARGAR CATEGORÍAS
  // =========================================================

  const cargarCategorias = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/categorias`);

      if (!res.ok) {
        console.error("No se pudieron cargar las categorías.");
        return;
      }

      const data = await res.json();

      setCategorias(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando categorías:", e);
    }
  }, []);

  // =========================================================
  // CARGAR DATOS INICIALES
  // =========================================================

  useEffect(() => {
    cargarSitios();
    cargarEventos();
    cargarCategorias();
  }, [cargarSitios, cargarEventos, cargarCategorias]);

  // =========================================================
  // CAMBIAR VISTA
  // =========================================================

  function cambiarVista(nuevaVista) {
    setVista(nuevaVista);
    setError("");
    setMensaje("");
    setFormAbierto(false);
    setConfirmarId(null);
  }

  // =========================================================
  // ABRIR FORMULARIO CREAR
  // =========================================================

  function abrirCrear() {
    setModoEdicion(false);
    setIdEnEdicion(null);

    if (vista === "sitios") {
      setFormSitio({
        ...SITIO_VACIO,
      });
    } else {
      setFormEvento({
        ...EVENTO_VACIO,
      });
    }

    setError("");
    setMensaje("");
    setFormAbierto(true);
  }

  // =========================================================
  // ABRIR FORMULARIO EDITAR
  // =========================================================

  function abrirEditar(item) {
    setModoEdicion(true);

    if (vista === "sitios") {
      setIdEnEdicion(item.id_sitio);

      setFormSitio({
        titulo_es: item.titulo_es || "",
        titulo_en: item.titulo_en || "",
        descripcion_es: item.descripcion_es || "",
        descripcion_en: item.descripcion_en || "",
        latitud: item.latitud ?? "",
        longitud: item.longitud ?? "",
        imagen_url: item.imagen_url || "",
        audioguia_url: item.audioguia_url || "",
      });
    } else {
      setIdEnEdicion(item.id_evento);

      let fecha = item.fecha_inicio || "";

      if (fecha && fecha.includes("T")) {
        fecha = fecha.slice(0, 16);
      }

      setFormEvento({
        titulo: item.titulo || "",
        descripcion: item.descripcion || "",
        lugar: item.lugar || "",
        fecha_inicio: fecha,
        imagen_url: item.imagen_url || "",
        estado_moderacion: item.estado_moderacion || "Pendiente",
        fuente_origen: item.fuente_origen || "Manual",
        id_categoria: item.id_categoria ?? "",
      });
    }

    setError("");
    setMensaje("");
    setFormAbierto(true);
  }

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  function cerrarFormulario() {
    if (guardando) {
      return;
    }

    setFormAbierto(false);
    setModoEdicion(false);
    setIdEnEdicion(null);

    setFormSitio({
      ...SITIO_VACIO,
    });

    setFormEvento({
      ...EVENTO_VACIO,
    });
  }

  // =========================================================
  // CAMBIO SITIO
  // =========================================================

  function cambiarSitio(e) {
    const { name, value } = e.target;

    setFormSitio((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================================================
  // CAMBIO EVENTO
  // =========================================================

  function cambiarEvento(e) {
    const { name, value } = e.target;

    setFormEvento((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================================================
  // GUARDAR
  // =========================================================

  async function guardar() {
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const token = obtenerToken();

      if (!token) {
        throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
      }

      let url;
      let method;
      let body;

      // =====================================================
      // SITIO
      // =====================================================

      if (vista === "sitios") {
        // -----------------------------------------
        // VALIDAR CAMPOS OBLIGATORIOS
        // -----------------------------------------

        if (!formSitio.titulo_es.trim()) {
          throw new Error("El título en español es obligatorio.");
        }

        if (!formSitio.titulo_en.trim()) {
          throw new Error("El título en inglés es obligatorio.");
        }

        if (!formSitio.descripcion_es.trim()) {
          throw new Error("La descripción en español es obligatoria.");
        }

        if (!formSitio.descripcion_en.trim()) {
          throw new Error("La descripción en inglés es obligatoria.");
        }

        if (formSitio.latitud === "") {
          throw new Error("La latitud es obligatoria.");
        }

        if (formSitio.longitud === "") {
          throw new Error("La longitud es obligatoria.");
        }

        const latitud = Number(formSitio.latitud);
        const longitud = Number(formSitio.longitud);

        if (Number.isNaN(latitud)) {
          throw new Error("La latitud debe ser un número válido.");
        }

        if (Number.isNaN(longitud)) {
          throw new Error("La longitud debe ser un número válido.");
        }

        // -----------------------------------------
        // URL
        // -----------------------------------------

        url = modoEdicion
          ? `${API_URL}/sitios/${idEnEdicion}`
          : `${API_URL}/sitios`;

        method = modoEdicion ? "PUT" : "POST";

        // -----------------------------------------
        // BODY
        // -----------------------------------------

        body = {
          titulo_es: formSitio.titulo_es.trim(),
          titulo_en: formSitio.titulo_en.trim(),
          descripcion_es: formSitio.descripcion_es.trim(),
          descripcion_en: formSitio.descripcion_en.trim(),
          latitud,
          longitud,
          imagen_url: formSitio.imagen_url.trim(),
          audioguia_url: formSitio.audioguia_url.trim(),
        };
      }

      // =====================================================
      // EVENTO
      // =====================================================
      else {
        if (!formEvento.titulo.trim()) {
          throw new Error("El título del evento es obligatorio.");
        }

        if (!formEvento.lugar.trim()) {
          throw new Error("El lugar del evento es obligatorio.");
        }

        url = modoEdicion
          ? `${API_URL}/eventos/${idEnEdicion}`
          : `${API_URL}/eventos`;

        method = modoEdicion ? "PUT" : "POST";

        body = {
          titulo: formEvento.titulo.trim(),

          descripcion: formEvento.descripcion.trim(),

          lugar: formEvento.lugar.trim(),

          fecha_inicio: formEvento.fecha_inicio
            ? new Date(formEvento.fecha_inicio).toISOString()
            : null,

          imagen_url: formEvento.imagen_url.trim(),

          estado_moderacion: formEvento.estado_moderacion,

          fuente_origen: formEvento.fuente_origen,

          id_categoria:
            formEvento.id_categoria === ""
              ? null
              : Number(formEvento.id_categoria),
        };
      }

      // =====================================================
      // PETICIÓN
      // =====================================================

      console.log("Enviando:", {
        url,
        method,
        body,
      });

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      // =====================================================
      // ERROR
      // =====================================================

      if (!res.ok) {
        let mensajeError = "No se pudo guardar la información.";

        try {
          const errorData = await res.json();

          console.error("Respuesta del backend:", errorData);

          if (errorData.message) {
            mensajeError = errorData.message;
          } else if (errorData.mensaje) {
            mensajeError = errorData.mensaje;
          } else if (errorData.error) {
            mensajeError = errorData.error;
          }
        } catch {
          console.error("El backend no devolvió JSON.");
        }

        if (res.status === 400) {
          mensajeError = mensajeError || "Los datos enviados no son válidos.";
        }

        if (res.status === 401 || res.status === 403) {
          mensajeError =
            "Acceso denegado. Tu sesión no es válida o no tienes permisos.";
        }

        throw new Error(mensajeError);
      }

      // =====================================================
      // ÉXITO
      // =====================================================

      const mensajeExito = modoEdicion
        ? "Información actualizada correctamente."
        : "Información creada correctamente.";

      cerrarFormulario();

      setMensaje(mensajeExito);

      // =====================================================
      // RECARGAR
      // =====================================================

      if (vista === "sitios") {
        await cargarSitios();
      } else {
        await cargarEventos();
      }
    } catch (e) {
      console.error(e);

      setError(e.message || "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  // =========================================================
  // ELIMINAR
  // =========================================================

  async function eliminar() {
    if (confirmarId === null) {
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const token = obtenerToken();

      if (!token) {
        throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
      }

      const endpoint =
        vista === "sitios"
          ? `${API_URL}/sitios/${confirmarId}`
          : `${API_URL}/eventos/${confirmarId}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        let mensajeError = "No se pudo eliminar el registro.";

        try {
          const errorData = await res.json();

          if (errorData.message) {
            mensajeError = errorData.message;
          } else if (errorData.mensaje) {
            mensajeError = errorData.mensaje;
          } else if (errorData.error) {
            mensajeError = errorData.error;
          }
        } catch {
          console.error("Sin respuesta JSON.");
        }

        if (res.status === 401 || res.status === 403) {
          mensajeError =
            "Acceso denegado. Tu sesión no es válida o no tienes permisos.";
        }

        throw new Error(mensajeError);
      }

      setConfirmarId(null);

      setMensaje(
        vista === "sitios"
          ? "Sitio eliminado correctamente."
          : "Evento eliminado correctamente.",
      );

      if (vista === "sitios") {
        await cargarSitios();
      } else {
        await cargarEventos();
      }
    } catch (e) {
      console.error(e);

      setError(e.message || "Ocurrió un error al eliminar.");
    } finally {
      setGuardando(false);
    }
  }

  // =========================================================
  // NOMBRE CATEGORÍA
  // =========================================================

  function nombreCategoria(id) {
    if (id === null || id === undefined || id === "") {
      return "—";
    }

    const categoria = categorias.find((c) => c.id_categoria === Number(id));

    return categoria?.nombre_categoria || "—";
  }

  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  function formatearFecha(fecha) {
    if (!fecha) {
      return "—";
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha;
    }

    return fechaObj.toLocaleString("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="pa-root">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="pa-header">
        <div className="pa-brand">
          <div className="pa-brand-mark">R</div>

          <div>
            <h1>Rastros del desierto</h1>

            <span>Panel de administración</span>
          </div>
        </div>
      </header>

      {/* =====================================================
          TABS
      ===================================================== */}

      <nav className="pa-tabs">
        <button
          className={vista === "sitios" ? "pa-tab pa-tab-active" : "pa-tab"}
          onClick={() => cambiarVista("sitios")}
        >
          📍 Sitios turísticos
        </button>

        <button
          className={vista === "eventos" ? "pa-tab pa-tab-active" : "pa-tab"}
          onClick={() => cambiarVista("eventos")}
        >
          📅 Eventos
        </button>
      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="pa-main">
        <div className="pa-toolbar">
          <div>
            <h2>
              {vista === "sitios" ? "Lugares turísticos" : "Agenda cultural"}
            </h2>

            <p>
              {vista === "sitios"
                ? "Administra los lugares turísticos de la región."
                : "Administra los eventos culturales de la región."}
            </p>
          </div>

          {/* =================================================
              BOTONES
          ================================================= */}

          <div className="pa-toolbar-actions">
            {vista === "eventos" && (
              <button
                type="button"
                className="pa-secondary-button"
                onClick={actualizarScraper}
                disabled={actualizandoScraper || guardando}
              >
                {actualizandoScraper
                  ? "🔄 Actualizando..."
                  : "🔄 Actualizar eventos"}
              </button>
            )}

            <button
              className="pa-primary-button"
              onClick={abrirCrear}
              disabled={actualizandoScraper}
            >
              +{vista === "sitios" ? " Nuevo sitio" : " Nuevo evento"}
            </button>
          </div>
        </div>

        {/* ===================================================
            MENSAJES
        =================================================== */}

        {mensaje && (
          <div className="pa-alert pa-alert-success">
            <span>✓</span>
            {mensaje}
          </div>
        )}

        {error && (
          <div className="pa-alert pa-alert-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* ===================================================
            SITIOS
        =================================================== */}

        {vista === "sitios" && (
          <section className="pa-section">
            {cargando ? (
              <div className="pa-empty">
                <div className="pa-spinner"></div>
                <p>Cargando sitios...</p>
              </div>
            ) : sitios.length === 0 ? (
              <div className="pa-empty">
                <div className="pa-empty-icon">📍</div>

                <h3>No hay sitios registrados</h3>

                <p>Comienza agregando el primer lugar turístico.</p>

                <button className="pa-primary-button" onClick={abrirCrear}>
                  + Crear sitio
                </button>
              </div>
            ) : (
              <div className="pa-table-container">
                <table className="pa-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Coordenadas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sitios.map((sitio) => (
                      <tr key={sitio.id_sitio}>
                        <td>
                          <span className="pa-id">#{sitio.id_sitio}</span>
                        </td>

                        <td>
                          {sitio.imagen_url ? (
                            <img
                              className="pa-table-image"
                              src={sitio.imagen_url}
                              alt={sitio.titulo_es}
                            />
                          ) : (
                            <div className="pa-table-placeholder">📍</div>
                          )}
                        </td>

                        <td>
                          <strong>{sitio.titulo_es}</strong>
                        </td>

                        <td>
                          <span className="pa-description">
                            {sitio.descripcion_es || "Sin descripción"}
                          </span>
                        </td>

                        <td>
                          <span className="pa-coordinates">
                            {sitio.latitud ?? "—"}, {sitio.longitud ?? "—"}
                          </span>
                        </td>

                        <td>
                          <div className="pa-actions">
                            <button
                              className="pa-action-edit"
                              onClick={() => abrirEditar(sitio)}
                            >
                              Editar
                            </button>

                            <button
                              className="pa-action-delete"
                              onClick={() => setConfirmarId(sitio.id_sitio)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            EVENTOS
        =================================================== */}

        {vista === "eventos" && (
          <section className="pa-section">
            {cargando ? (
              <div className="pa-empty">
                <div className="pa-spinner"></div>
                <p>Cargando eventos...</p>
              </div>
            ) : eventos.length === 0 ? (
              <div className="pa-empty">
                <div className="pa-empty-icon">📅</div>

                <h3>No hay eventos registrados</h3>

                <p>Comienza agregando el primer evento.</p>

                <button className="pa-primary-button" onClick={abrirCrear}>
                  + Crear evento
                </button>
              </div>
            ) : (
              <div className="pa-table-container">
                <table className="pa-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Evento</th>
                      <th>Lugar</th>
                      <th>Fecha</th>
                      <th>Categoría</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {eventos.map((evento) => (
                      <tr key={evento.id_evento}>
                        <td>
                          <span className="pa-id">#{evento.id_evento}</span>
                        </td>

                        <td>
                          {evento.imagen_url ? (
                            <img
                              className="pa-table-image"
                              src={evento.imagen_url}
                              alt={evento.titulo}
                            />
                          ) : (
                            <div className="pa-table-placeholder">📅</div>
                          )}
                        </td>

                        <td>
                          <strong>{evento.titulo}</strong>

                          <span className="pa-description">
                            {evento.descripcion || "Sin descripción"}
                          </span>
                        </td>

                        <td>{evento.lugar || "—"}</td>

                        <td>{formatearFecha(evento.fecha_inicio)}</td>

                        <td>{nombreCategoria(evento.id_categoria)}</td>

                        <td>
                          <span
                            className={`pa-badge ${
                              evento.estado_moderacion === "Aprobado"
                                ? "pa-badge-aprobado"
                                : evento.estado_moderacion === "Rechazado"
                                  ? "pa-badge-rechazado"
                                  : "pa-badge-pendiente"
                            }`}
                          >
                            {evento.estado_moderacion || "Pendiente"}
                          </span>
                        </td>

                        <td>
                          <div className="pa-actions">
                            <button
                              className="pa-action-edit"
                              onClick={() => abrirEditar(evento)}
                            >
                              Editar
                            </button>

                            <button
                              className="pa-action-delete"
                              onClick={() => setConfirmarId(evento.id_evento)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* =====================================================
          MODAL CREAR / EDITAR
      ===================================================== */}

      {formAbierto && (
        <div
          className="pa-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarFormulario();
            }
          }}
        >
          <div className="pa-modal">
            <div className="pa-modal-header">
              <div>
                <span className="pa-modal-label">
                  {vista === "sitios" ? "LUGAR TURÍSTICO" : "EVENTO CULTURAL"}
                </span>

                <h2>
                  {modoEdicion ? "Editar" : "Nuevo"}{" "}
                  {vista === "sitios" ? "sitio" : "evento"}
                </h2>
              </div>

              <button
                className="pa-modal-close"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                ×
              </button>
            </div>

            {/* =================================================
                FORMULARIO SITIO
            ================================================= */}

            {vista === "sitios" && (
              <div className="pa-form">
                <div className="pa-form-grid">
                  <div className="pa-form-group">
                    <label>Título en español *</label>

                    <input
                      type="text"
                      name="titulo_es"
                      value={formSitio.titulo_es}
                      onChange={cambiarSitio}
                      placeholder="Ej: Valle de Azapa"
                    />
                  </div>

                  <div className="pa-form-group">
                    <label>Título en inglés *</label>

                    <input
                      type="text"
                      name="titulo_en"
                      value={formSitio.titulo_en}
                      onChange={cambiarSitio}
                      placeholder="English title"
                    />
                  </div>
                </div>

                <div className="pa-form-group">
                  <label>Descripción en español *</label>

                  <textarea
                    name="descripcion_es"
                    value={formSitio.descripcion_es}
                    onChange={cambiarSitio}
                    placeholder="Describe el lugar turístico..."
                    rows="4"
                  />
                </div>

                <div className="pa-form-group">
                  <label>Descripción en inglés *</label>

                  <textarea
                    name="descripcion_en"
                    value={formSitio.descripcion_en}
                    onChange={cambiarSitio}
                    placeholder="Describe the tourist site..."
                    rows="4"
                  />
                </div>

                <div className="pa-form-grid">
                  <div className="pa-form-group">
                    <label>Latitud *</label>

                    <input
                      type="number"
                      step="any"
                      name="latitud"
                      value={formSitio.latitud}
                      onChange={cambiarSitio}
                      placeholder="-18.4783"
                    />
                  </div>

                  <div className="pa-form-group">
                    <label>Longitud *</label>

                    <input
                      type="number"
                      step="any"
                      name="longitud"
                      value={formSitio.longitud}
                      onChange={cambiarSitio}
                      placeholder="-70.3126"
                    />
                  </div>
                </div>

                <div className="pa-form-group">
                  <label>URL de imagen</label>

                  <input
                    type="url"
                    name="imagen_url"
                    value={formSitio.imagen_url}
                    onChange={cambiarSitio}
                    placeholder="https://..."
                  />
                </div>

                <div className="pa-form-group">
                  <label>URL de audioguía</label>

                  <input
                    type="url"
                    name="audioguia_url"
                    value={formSitio.audioguia_url}
                    onChange={cambiarSitio}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* =================================================
                FORMULARIO EVENTO
            ================================================= */}

            {vista === "eventos" && (
              <div className="pa-form">
                <div className="pa-form-group">
                  <label>Título *</label>

                  <input
                    type="text"
                    name="titulo"
                    value={formEvento.titulo}
                    onChange={cambiarEvento}
                    placeholder="Ej: Festival de la Primavera"
                  />
                </div>

                <div className="pa-form-group">
                  <label>Descripción</label>

                  <textarea
                    name="descripcion"
                    value={formEvento.descripcion}
                    onChange={cambiarEvento}
                    placeholder="Describe el evento..."
                    rows="4"
                  />
                </div>

                <div className="pa-form-grid">
                  <div className="pa-form-group">
                    <label>Lugar *</label>

                    <input
                      type="text"
                      name="lugar"
                      value={formEvento.lugar}
                      onChange={cambiarEvento}
                      placeholder="Ej: Plaza Colón"
                    />
                  </div>

                  <div className="pa-form-group">
                    <label>Fecha y hora</label>

                    <input
                      type="datetime-local"
                      name="fecha_inicio"
                      value={formEvento.fecha_inicio}
                      onChange={cambiarEvento}
                    />
                  </div>
                </div>

                <div className="pa-form-group">
                  <label>URL de imagen</label>

                  <input
                    type="url"
                    name="imagen_url"
                    value={formEvento.imagen_url}
                    onChange={cambiarEvento}
                    placeholder="https://..."
                  />
                </div>

                <div className="pa-form-grid">
                  <div className="pa-form-group">
                    <label>Categoría</label>

                    <select
                      name="id_categoria"
                      value={formEvento.id_categoria}
                      onChange={cambiarEvento}
                    >
                      <option value="">Seleccionar categoría</option>

                      {categorias.map((categoria) => (
                        <option
                          key={categoria.id_categoria}
                          value={categoria.id_categoria}
                        >
                          {categoria.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pa-form-group">
                    <label>Estado de moderación</label>

                    <select
                      name="estado_moderacion"
                      value={formEvento.estado_moderacion}
                      onChange={cambiarEvento}
                    >
                      {ESTADOS_MODERACION.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pa-form-group">
                  <label>Fuente de origen</label>

                  <select
                    name="fuente_origen"
                    value={formEvento.fuente_origen}
                    onChange={cambiarEvento}
                  >
                    {FUENTES_ORIGEN.map((fuente) => (
                      <option key={fuente} value={fuente}>
                        {fuente}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* =================================================
                ACCIONES
            ================================================= */}

            <div className="pa-form-actions">
              <button
                className="pa-secondary-button"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                className="pa-primary-button"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : modoEdicion
                    ? "Guardar cambios"
                    : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL ELIMINAR
      ===================================================== */}

      {confirmarId !== null && (
        <div className="pa-modal-overlay">
          <div className="pa-confirm-modal">
            <div className="pa-confirm-icon">!</div>

            <h2>
              ¿Eliminar {vista === "sitios" ? "este sitio" : "este evento"}?
            </h2>

            <p>
              Esta acción no se puede deshacer. El registro será eliminado
              permanentemente.
            </p>

            <div className="pa-form-actions">
              <button
                className="pa-secondary-button"
                onClick={() => setConfirmarId(null)}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                className="pa-delete-confirm"
                onClick={eliminar}
                disabled={guardando}
              >
                {guardando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
