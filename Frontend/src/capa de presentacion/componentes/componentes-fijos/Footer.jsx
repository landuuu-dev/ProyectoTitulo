import React from "react";
import { Link } from "react-router-dom";
import "../estilos/estilos-footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__contenido">
        {/* =====================================================
            MARCA
        ===================================================== */}

        <div className="footer__marca">
          <Link to="/" className="footer__logo">
            Rastros del desierto
          </Link>

          <p>Descubre, explora y disfruta cada rincón del desierto de Arica.</p>
        </div>

        {/* =====================================================
            NAVEGACIÓN
        ===================================================== */}

        <div className="footer__seccion">
          <h3>Explora</h3>

          <Link to="/">Inicio</Link>

          <Link to="/sitios">Lugares turísticos</Link>

          <Link to="/eventos">Eventos culturales</Link>
        </div>

        {/* =====================================================
            CUENTA
        ===================================================== */}

        <div className="footer__seccion">
          <h3>Tu cuenta</h3>

          <Link to="/registro">Registrarse</Link>

          <Link to="/iniciar-sesion">Iniciar sesión</Link>
        </div>
      </div>

      {/* =====================================================
          PARTE INFERIOR
      ===================================================== */}

      <div className="footer__inferior">
        <p>© {new Date().getFullYear()} Rastros del desierto</p>

        <p>Guía turística y patrimonial de Arica</p>
      </div>
    </footer>
  );
}
