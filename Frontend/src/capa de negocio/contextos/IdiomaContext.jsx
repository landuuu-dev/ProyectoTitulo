import React, { createContext, useContext, useState } from "react";

const IdiomaContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(() => {
    return localStorage.getItem("idioma") || "es";
  });

  const [traduciendo, setTraduciendo] = useState(false);

  const cambiarIdioma = () => {
    const nuevoIdioma = idioma === "es" ? "en" : "es";

    setIdioma(nuevoIdioma);

    localStorage.setItem("idioma", nuevoIdioma);
  };

  const traducirTextos = async (textos, idiomaOrigen, idiomaDestino) => {
    try {
      if (!Array.isArray(textos) || textos.length === 0) {
        console.error("No hay textos para traducir:", textos);

        return null;
      }

      console.log("Enviando textos a DeepL:", textos);

      const respuesta = await fetch(`${API_URL}/traduccion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textos: textos,
          idiomaOrigen: idiomaOrigen,
          idiomaDestino: idiomaDestino,
        }),
      });

      const data = await respuesta.json();

      console.log("Respuesta del backend:", data);

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "Error al realizar la traducción.");
      }

      return data.traducciones;
    } catch (error) {
      console.error("Error comunicándose con DeepL:", error);

      return null;
    }
  };

  return (
    <IdiomaContext.Provider
      value={{
        idioma,
        cambiarIdioma,
        traducirTextos,
        traduciendo,
        setTraduciendo,
      }}
    >
      {children}
    </IdiomaContext.Provider>
  );
}

export function useIdioma() {
  const contexto = useContext(IdiomaContext);

  if (!contexto) {
    throw new Error("useIdioma debe utilizarse dentro de IdiomaProvider.");
  }

  return contexto;
}
