import React, { useEffect, useState } from "react";
import axios from "axios";
import "./estilosPages/sitios.css";
import cerroImg from "../../assets/cerro.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Sitios() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/sitios`);
        setData(response.data);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="sitios-pagina">
      {/* HERO */}
      <div
        className="sitios-hero"
        style={{ backgroundImage: `url(${cerroImg})` }}
      >
        <div className="sitios-hero__overlay"></div>

        <div className="sitios-hero__contenido">
          <span className="sitios-hero__etiqueta">Rastros del desierto</span>

          <h1 className="sitios-titulo">Lugares turísticos</h1>

          <p className="sitios-hero__descripcion">
            Explora los paisajes, lugares y rincones que hacen única a nuestra
            región.
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="sitios-buscador-contenedor">
        <label className="sitios-buscador-label">
          Explora nuestros destinos
        </label>

        <div className="sitios-buscador">
          <span className="sitios-buscador-icono">🔍</span>

          <input
            type="text"
            placeholder="Buscar lugar turístico"
            className="sitios-buscador-input"
          />
        </div>
      </div>

      {/* LISTA */}
      <div className="sitios-lista">
        {data.map((sitio) => (
          <div className="sitio-tarjeta" key={sitio.id_sitio}>
            <div className="sitio-imagen-wrap">
              {sitio.imagen_url ? (
                <img
                  className="sitio-imagen"
                  src={sitio.imagen_url}
                  alt={`Imagen de ${sitio.titulo_es}`}
                />
              ) : (
                <div className="sitio-placeholder">Sin imagen</div>
              )}
            </div>

            <div className="sitio-info">
              <h2 className="sitio-nombre">{sitio.titulo_es}</h2>

              <p className="sitio-descripcion">{sitio.descripcion_es}</p>

              <button className="sitio-boton">Ver más</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
