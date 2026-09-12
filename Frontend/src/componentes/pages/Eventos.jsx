import axios from "axios";
import React, { useEffect, useState } from "react";
import "./estilosPages/eventos.css";
import cerroImg from "../../assets/cerro.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Eventos() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/eventos`);
        setData(response.data);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="eventos-pagina">
      <div
        className="eventos-hero"
        style={{ backgroundImage: `url(${cerroImg})` }}
      >
        <div className="eventos-hero__overlay"></div>

        <div className="eventos-hero__contenido">
          <span className="eventos-hero__etiqueta">Rastros del desierto</span>

          <h1 className="eventos-titulo">Agenda cultural</h1>

          <p className="eventos-hero__descripcion">
            Descubre eventos y experiencias culturales de la región.
          </p>
        </div>
      </div>
      <div className="eventos-filtro">
        <span className="eventos-filtro-label">Filtrar</span>

        <div className="eventos-filtro-fila">
          <div className="eventos-filtro-campo">
            <span className="eventos-filtro-icono">📅</span>
            <input
              type="text"
              placeholder="Inicio - fin"
              className="eventos-filtro-input"
            />
          </div>

          <div className="eventos-filtro-campo">
            <span className="eventos-filtro-icono">🔍</span>
            <input
              type="text"
              placeholder="Buscar evento"
              className="eventos-filtro-input"
            />
          </div>
        </div>
      </div>

      <div className="eventos-lista">
        {data.map((evento) => (
          <div className="evento-tarjeta" key={evento.id_evento}>
            <div className="evento-imagen-wrap">
              <img
                className="evento-imagen"
                src={evento.imagen_url || "/placeholder-evento.jpg"}
                alt={`Imagen de ${evento.titulo}`}
              />
            </div>

            <div className="evento-info">
              <h2 className="evento-nombre">{evento.titulo}</h2>
              <p className="evento-descripcion">{evento.descripcion}</p>
              <button className="evento-boton">Ver mas</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
