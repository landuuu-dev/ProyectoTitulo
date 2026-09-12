import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../estilos/estilos-navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarUsuario();

    // Detecta cuando cambia el inicio/cierre de sesión
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

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  }

  const esAdministrador = usuario?.nombre_rol === "Administrador";

  const esUsuario = usuario?.nombre_rol === "Usuario";

  return (
    <nav className="nav">
      <Link to="/" className="logo">
        Rastros del desierto
      </Link>

      <ul>
        <li>
          <Link to="/eventos" className="boton-1">
            Eventos culturales
          </Link>
        </li>

        <li>
          <Link to="/sitios" className="boton-1">
            Lugares turisticos
          </Link>
        </li>

        {/* =========================================
            USUARIO NO LOGUEADO
        ========================================= */}

        {!usuario && (
          <>
            <li>
              <Link to="/registro" className="boton-auth">
                Registrarse
              </Link>
            </li>

            <li>
              <Link to="/iniciar-sesion" className="boton-auth">
                Iniciar sesion
              </Link>
            </li>
          </>
        )}

        {/* =========================================
            ADMINISTRADOR
        ========================================= */}

        {esAdministrador && (
          <li>
            <Link to="/panel-administracion" className="boton-auth">
              Panel de administración
            </Link>
          </li>
        )}

        {/* =========================================
            USUARIO NORMAL
        ========================================= */}

        {esUsuario && (
          <li>
            <Link to="/perfil-usuario" className="boton-auth">
              Mi perfil
            </Link>
          </li>
        )}

        {/* =========================================
            CERRAR SESIÓN
        ========================================= */}

        {usuario && (
          <li>
            <button type="button" className="boton-auth" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
