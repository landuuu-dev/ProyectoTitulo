import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/estilosPages/inicioSesion.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function InicioSesion() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formulario.email.trim() || !formulario.password) {
      setError("Completa todos los campos.");
      return;
    }

    try {
      setCargando(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formulario.email.trim(),
          password: formulario.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensaje || data.message || "Correo o contraseña incorrectos.",
        );
      }

      // =========================================
      // GUARDAR SESIÓN
      // =========================================

      sessionStorage.setItem("token", data.token);

      sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Avisar al Navbar que cambió la sesión
      window.dispatchEvent(new Event("authChanged"));

      // =========================================
      // REDIRECCIÓN SEGÚN ROL
      // =========================================

      const rol = data.usuario?.nombre_rol;

      if (rol === "Administrador") {
        navigate("/panel-administracion");
        return;
      }

      if (rol === "Usuario") {
        navigate("/perfil-usuario");
        return;
      }

      setError("El usuario tiene un rol no válido.");
    } catch (err) {
      setError(err.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card login-card">
        <h1 className="registro-titulo">Inicio de sesión</h1>

        <div className="registro-icono">
          <div className="icono-usuario"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              name="email"
              value={formulario.email}
              onChange={handleChange}
              disabled={cargando}
              autoComplete="email"
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              name="password"
              value={formulario.password}
              onChange={handleChange}
              disabled={cargando}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="mensaje mensaje-error">{error}</div>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
