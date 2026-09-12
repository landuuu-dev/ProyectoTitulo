import React, { useEffect, useState } from "react";
import "./estilosPages/perfilUsuario.css";

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const cargarUsuario = () => {
      const usuarioGuardado = sessionStorage.getItem("usuario");

      if (!usuarioGuardado) {
        setUsuario(null);
        return;
      }

      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        setUsuario(null);
      }
    };

    cargarUsuario();

    window.addEventListener("authChanged", cargarUsuario);

    return () => {
      window.removeEventListener("authChanged", cargarUsuario);
    };
  }, []);

  if (!usuario) {
    return (
      <main className="perfil-root">
        <section className="perfil-card">
          <h1>No hay una sesión iniciada</h1>
          <p>Inicia sesión para poder visualizar tu información.</p>
        </section>
      </main>
    );
  }

  const fechaRegistro = usuario.fecha_registro
    ? new Date(usuario.fecha_registro).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "No disponible";

  return (
    <main className="perfil-root">
      <section className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-avatar">
            {usuario.nombre?.charAt(0).toUpperCase() || "U"}
          </div>

          <div>
            <p className="perfil-subtitulo">Mi cuenta</p>
            <h1>{usuario.nombre || "Usuario"}</h1>
            <span className="perfil-rol">
              {usuario.nombre_rol || "Usuario"}
            </span>
          </div>
        </div>

        <div className="perfil-separador"></div>

        <section className="perfil-informacion">
          <h2>Información personal</h2>

          <div className="perfil-datos">
            <div className="perfil-dato">
              <span className="dato-label">ID de usuario</span>
              <span className="dato-valor">
                {usuario.id_usuario ?? "No disponible"}
              </span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Nombre</span>
              <span className="dato-valor">
                {usuario.nombre || "No disponible"}
              </span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Correo electrónico</span>
              <span className="dato-valor">
                {usuario.email || "No disponible"}
              </span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Fecha de registro</span>
              <span className="dato-valor">{fechaRegistro}</span>
            </div>

            <div className="perfil-dato">
              <span className="dato-label">Tipo de cuenta</span>
              <span className="dato-valor">
                {usuario.nombre_rol || "No disponible"}
              </span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
