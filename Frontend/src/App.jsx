import { useState } from "react";
import "./App.css";
import Navbar from "./componentes/componentes-fijos/Navbar";
import Eventos from "./componentes/pages/Eventos";
import Sitios from "./componentes/pages/Sitios";
import Registro from "./componentes/pages/Registro";
import InicioSesion from "./componentes/pages/InicioSesion";
import Home from "./componentes/pages/Home";

function App() {
  let Component;

  switch (window.location.pathname) {
    case "/":
      Component = Home;
      break;
    case "/eventos":
      Component = Eventos;
      break;
    case "/sitios":
      Component = Sitios;
      break;
    case "/registro":
      Component = Registro;
      break;
    case "/iniciar-sesion":
      Component = InicioSesion;
      break;
    default:
      Component = Home;
      break;
  }

  return (
    <>
      <Navbar></Navbar>
      <Component></Component>
    </>
  );
}

export default App;
