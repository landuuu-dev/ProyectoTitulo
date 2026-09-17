import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { IdiomaProvider } from "./capa de negocio/contextos/IdiomaContext";

import TraductorPagina from "./capa de negocio/contextos/TraductorPagina";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IdiomaProvider>
      <TraductorPagina />

      <App />
    </IdiomaProvider>
  </React.StrictMode>,
);
