import React from "react";
import "../estilos/estilos-navbar.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <a href="/" className="logo">
        Rastros del desierto
      </a>
      <ul>
        <li>
          <a href="/eventos" className="boton-1">
            Eventos culturales
          </a>
        </li>
        <li>
          <a href="/sitios" className="boton-1">
            Lugares turisticos
          </a>
        </li>
        <li>
          <a href="/registro" className="boton-auth">
            Registrarse
          </a>
        </li>
        <li>
          <a href="/iniciar-sesion" className="boton-auth">
            Iniciar sesion
          </a>
        </li>
      </ul>
    </nav>
  );
}
