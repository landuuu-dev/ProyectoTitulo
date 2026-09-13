import "./App.css";

import Navbar from "./componentes/componentes-fijos/Navbar";
import Footer from "./componentes/componentes-fijos/Footer";

import Eventos from "./componentes/pages/Eventos";
import Sitios from "./componentes/pages/Sitios";
import Registro from "./componentes/pages/Registro";
import InicioSesion from "./componentes/pages/InicioSesion";
import Home from "./componentes/pages/Home";
import PanelAdministracion from "./componentes/pages/PanelAdministracion";
import PerfilUsuario from "./componentes/pages/PerfilUsuario";

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
