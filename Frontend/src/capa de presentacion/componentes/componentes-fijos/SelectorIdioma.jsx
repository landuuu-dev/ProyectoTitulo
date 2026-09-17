import React from "react";
import { useIdioma } from "../../../capa de negocio/contextos/IdiomaContext";
import "../estilos/estilos-selector-idioma.css";

export default function SelectorIdioma() {
  const { idioma, cambiarIdioma, traduciendo } = useIdioma();

  const inglesActivo = idioma === "en";

  return (
    <div className="selector-idioma">
      <span
        className={`selector-idioma__texto ${!inglesActivo ? "activo" : ""}`}
      >
        🇪🇸 ES
      </span>

      <button
        type="button"
        className={`selector-idioma__switch ${inglesActivo ? "ingles" : ""}`}
        onClick={cambiarIdioma}
        disabled={traduciendo}
        aria-label={inglesActivo ? "Cambiar a español" : "Switch to English"}
      >
        <span className="selector-idioma__circulo"></span>
      </button>

      <span
        className={`selector-idioma__texto ${inglesActivo ? "activo" : ""}`}
      >
        EN 🇬🇧
      </span>
    </div>
  );
}
