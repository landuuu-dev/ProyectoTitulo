import "./App.css";

import Navbar from "./capa de presentacion/componentes/componentes-fijos/Navbar";
import Footer from "./capa de presentacion/componentes/componentes-fijos/Footer";

import Eventos from "./capa de presentacion/componentes/pages/Eventos";
import Sitios from "./capa de presentacion/componentes/pages/Sitios";
import Registro from "./capa de presentacion/componentes/pages/Registro";
import InicioSesion from "./capa de presentacion/componentes/pages/InicioSesion";
import Home from "./capa de presentacion/componentes/pages/Home";
import PanelAdministracion from "./capa de presentacion/componentes/pages/PanelAdministracion";
import PerfilUsuario from "./capa de presentacion/componentes/pages/PerfilUsuario";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/eventos" element={<Eventos />} />

        <Route path="/sitios" element={<Sitios />} />

        <Route path="/registro" element={<Registro />} />

        <Route path="/iniciar-sesion" element={<InicioSesion />} />

        <Route path="/panel-administracion" element={<PanelAdministracion />} />

        <Route path="/perfil-usuario" element={<PerfilUsuario />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
