import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "../estilos/estilos-navbar.css";

import SelectorIdioma from "./SelectorIdioma";

export default function Navbar() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);

  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    cargarUsuario();

    const actualizarUsuario = () => {
      cargarUsuario();
    };

    window.addEventListener("authChanged", actualizarUsuario);

    return () => {
      window.removeEventListener("authChanged", actualizarUsuario);
    };
  }, []);

  function cargarUsuario() {
    const usuarioGuardado = sessionStorage.getItem("usuario");

    if (usuarioGuardado) {
      try {
        const usuarioParseado = JSON.parse(usuarioGuardado);

        setUsuario(usuarioParseado);
      } catch (error) {
        console.error("Error leyendo usuario:", error);

        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    setUsuario(null);
    setMenuAbierto(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  const esAdministrador = usuario?.nombre_rol === "Administrador";

  const esUsuario = usuario?.nombre_rol === "Usuario";

  return (
    <nav className="nav">
      {/* LOGO */}

      <Link
        to="/"
        className="logo"
        onClick={cerrarMenu}
        data-no-traducir="true"
      >
        Rastros del desierto
      </Link>

      {/* MENÚ */}

      <ul className={`nav-menu ${menuAbierto ? "nav-menu-abierto" : ""}`}>
        {/* EVENTOS */}

        <li>
          <Link to="/eventos" className="boton-1" onClick={cerrarMenu}>
            Eventos culturales
          </Link>
        </li>

        {/* SITIOS */}

        <li>
          <Link to="/sitios" className="boton-1" onClick={cerrarMenu}>
            Lugares turísticos
          </Link>
        </li>

        {/* IDIOMA */}

        <li className="nav-idioma">
          <SelectorIdioma />
        </li>

        {/* NO AUTENTICADO */}

        {!usuario && (
          <>
            <li>
              <Link to="/registro" className="boton-auth" onClick={cerrarMenu}>
                Registrarse
              </Link>
            </li>

            <li>
              <Link
                to="/iniciar-sesion"
                className="boton-auth"
                onClick={cerrarMenu}
              >
                Iniciar sesión
              </Link>
            </li>
          </>
        )}

        {/* ADMINISTRADOR */}

        {esAdministrador && (
          <li>
            <Link
              to="/panel-administracion"
              className="boton-auth"
              onClick={cerrarMenu}
            >
              Panel de administración
            </Link>
          </li>
        )}

        {/* USUARIO */}

        {esUsuario && (
          <li>
            <Link
              to="/perfil-usuario"
              className="boton-auth"
              onClick={cerrarMenu}
            >
              Mi perfil
            </Link>
          </li>
        )}

        {/* CERRAR SESIÓN */}

        {usuario && (
          <li>
            <button type="button" className="boton-auth" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </li>
        )}
      </ul>

      {/* HAMBURGUESA */}

      <button
        type="button"
        className={`menu-hamburguesa ${
          menuAbierto ? "menu-hamburguesa-activo" : ""
        }`}
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
