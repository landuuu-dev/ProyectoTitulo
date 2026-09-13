import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { IdiomaProvider } from "./contextos/IdiomaContext";

import TraductorPagina from "./componentes/componentes-fijos/TraductorPagina";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IdiomaProvider>
      <TraductorPagina />

      <App />
    </IdiomaProvider>
  </React.StrictMode>,
);
