import React, { useEffect } from "react";
import "../estilos/modalDetalle.css";

export default function ModalDetalle({ abierto, onCerrar, tipo, datos }) {
  useEffect(() => {
    if (!abierto) return;

    const manejarTecla = (e) => {
      if (e.key === "Escape") {
        onCerrar();
      }
    };

    document.addEventListener("keydown", manejarTecla);

    // Evita que la página se desplace mientras el modal está abierto
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", manejarTecla);
      document.body.style.overflow = "";
    };
  }, [abierto, onCerrar]);

  if (!abierto || !datos) {
    return null;
  }

  const esSitio = tipo === "sitio";
  const esEvento = tipo === "evento";

  const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible";

    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const manejarClickFondo = (e) => {
    if (e.target === e.currentTarget) {
      onCerrar();
    }
  };

  return (
    <div className="modal-detalle__fondo" onClick={manejarClickFondo}>
      <div
        className="modal-detalle"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detalle-titulo"
      >
        <button
          type="button"
          className="modal-detalle__cerrar"
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* IMAGEN */}
        <div className="modal-detalle__imagen">
          {datos.imagen_url ? (
            <img
              src={datos.imagen_url}
              alt={esSitio ? datos.titulo_es : datos.titulo}
            />
          ) : (
            <div className="modal-detalle__sin-imagen">
              {esSitio ? "🏜️" : "🎭"}
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="modal-detalle__contenido">
          {esSitio && (
            <>
              <span className="modal-detalle__categoria">Lugar turístico</span>

              <h2 id="modal-detalle-titulo">{datos.titulo_es}</h2>

              {datos.titulo_en && (
                <p className="modal-detalle__titulo-ingles">
                  {datos.titulo_en}
                </p>
              )}

              <div className="modal-detalle__seccion">
                <h3>Descripción</h3>

                <p>
                  {datos.descripcion_es || "No hay descripción disponible."}
                </p>
              </div>

              {datos.descripcion_en && (
                <div className="modal-detalle__seccion">
                  <h3>Description</h3>

                  <p>{datos.descripcion_en}</p>
                </div>
              )}

              <div className="modal-detalle__datos">
                {datos.latitud !== undefined &&
                  datos.longitud !== undefined && (
                    <div className="modal-detalle__dato">
                      <span>📍</span>

                      <div>
                        <strong>Ubicación</strong>

                        <p>
                          {datos.latitud}, {datos.longitud}
                        </p>
                      </div>
                    </div>
                  )}

                {datos.nombre_creador && (
                  <div className="modal-detalle__dato">
                    <span>👤</span>

                    <div>
                      <strong>Creado por</strong>

                      <p>{datos.nombre_creador}</p>
                    </div>
                  </div>
                )}
              </div>

              {datos.audioguia_url && (
                <div className="modal-detalle__seccion">
                  <h3>🎧 Audioguía</h3>

                  <audio
                    controls
                    src={datos.audioguia_url}
                    className="modal-detalle__audio"
                  >
                    Tu navegador no soporta reproducción de audio.
                  </audio>
                </div>
              )}
            </>
          )}

          {esEvento && (
            <>
              {datos.nombre_categoria && (
                <span className="modal-detalle__categoria">
                  {datos.nombre_categoria}
                </span>
              )}

              <h2 id="modal-detalle-titulo">{datos.titulo}</h2>

              <div className="modal-detalle__seccion">
                <h3>Descripción</h3>

                <p>{datos.descripcion || "No hay descripción disponible."}</p>
              </div>

              <div className="modal-detalle__datos">
                {datos.lugar && (
                  <div className="modal-detalle__dato">
                    <span>📍</span>

                    <div>
                      <strong>Lugar</strong>

                      <p>{datos.lugar}</p>
                    </div>
                  </div>
                )}

                {datos.fecha_inicio && (
                  <div className="modal-detalle__dato">
                    <span>📅</span>

                    <div>
                      <strong>Fecha y hora</strong>

                      <p>{formatearFecha(datos.fecha_inicio)}</p>
                    </div>
                  </div>
                )}

                {datos.estado_moderacion && (
                  <div className="modal-detalle__dato">
                    <span>📋</span>

                    <div>
                      <strong>Estado</strong>

                      <p>{datos.estado_moderacion}</p>
                    </div>
                  </div>
                )}

                {datos.fuente_origen && (
                  <div className="modal-detalle__dato">
                    <span>📌</span>

                    <div>
                      <strong>Fuente</strong>

                      <p>{datos.fuente_origen}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
