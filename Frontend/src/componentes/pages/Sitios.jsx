import React, { useEffect, useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import "./estilosPages/sitios.css";

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
      <h1 className="sitios-titulo">Lugares turísticos</h1>

      <div className="sitios-buscador">
        <span className="sitios-buscador-icono">🔍</span>
        <input
          type="text"
          placeholder="Buscar"
          className="sitios-buscador-input"
        />
      </div>

      <div className="sitios-lista">
        {data.map((sitio) => (
          <div className="sitio-tarjeta" key={sitio.id_sitio}>
            <div className="sitio-imagen-wrap">
              <img
                className="sitio-imagen"
                src={sitio.imagen_url}
                alt={`Imagen de ${sitio.titulo_es}`}
              />
            </div>

            <div className="sitio-info">
              <h2 className="sitio-nombre">{sitio.titulo_es}</h2>
              <p className="sitio-descripcion">{sitio.descripcion_es}</p>
              <button className="sitio-boton">Ver mas</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
