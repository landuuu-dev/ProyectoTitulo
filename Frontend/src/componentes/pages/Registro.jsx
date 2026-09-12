import React, { useState } from "react";
import "../pages/estilosPages/registro.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    // Validaciones
    if (
      !formulario.nombre.trim() ||
      !formulario.email.trim() ||
      !formulario.password
    ) {
      setError("Completa todos los campos.");
      return;
    }

    if (formulario.password !== formulario.confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (formulario.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setCargando(true);

      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          email: formulario.email.trim(),
          password: formulario.password,
          id_rol: 2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensaje || data.message || "No se pudo crear la cuenta.",
        );
      }

      setMensaje("¡Cuenta creada correctamente!");

      setFormulario({
        nombre: "",
        email: "",
        password: "",
        confirmarPassword: "",
      });
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrarse.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h1 className="registro-titulo">Registro</h1>

        <div className="registro-icono">
          <div className="icono-usuario"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="nombre">Nombre de usuario</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formulario.email}
              onChange={handleChange}
              disabled={cargando}
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
            />
          </div>

          <div className="campo">
            <label htmlFor="confirmarPassword">
              Confirmación de contraseña
            </label>
            <input
              id="confirmarPassword"
              type="password"
              name="confirmarPassword"
              value={formulario.confirmarPassword}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          {error && <div className="mensaje mensaje-error">{error}</div>}

          {mensaje && <div className="mensaje mensaje-exito">{mensaje}</div>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>
      </div>
    </div>
  );
}
