import React, { useEffect, useRef } from "react";

import { useIdioma } from "../../contextos/IdiomaContext";

export default function TraductorPagina() {
  const { idioma, traducirTextos } = useIdioma();

  const textosOriginales = useRef(new Map());

  useEffect(() => {
    let cancelado = false;

    const traducirPagina = async () => {
      // =====================================================
      // ESPAÑOL
      // Restauramos los textos originales
      // =====================================================

      if (idioma === "es") {
        textosOriginales.current.forEach((textoOriginal, nodo) => {
          if (nodo && nodo.isConnected) {
            nodo.textContent = textoOriginal;
          }
        });

        return;
      }

      // =====================================================
      // INGLÉS
      // Buscamos los textos visibles de la página
      // =====================================================

      const nodos = obtenerNodosTexto();

      const nodosTraducibles = [];
      const textos = [];

      nodos.forEach((nodo) => {
        if (!nodo.textContent.trim()) {
          return;
        }

        // Guardamos el texto original solamente
        // la primera vez.
        if (!textosOriginales.current.has(nodo)) {
          textosOriginales.current.set(nodo, nodo.textContent);
        }

        nodosTraducibles.push(nodo);
        textos.push(nodo.textContent.trim());
      });

      if (textos.length === 0) {
        return;
      }

      // =====================================================
      // Evitar textos repetidos
      // =====================================================

      const textosUnicos = [...new Set(textos)];

      const traducciones = await traducirTextos(textosUnicos, "ES", "EN");

      if (cancelado || !traducciones) {
        return;
      }

      // =====================================================
      // Crear mapa original → traducción
      // =====================================================

      const mapaTraducciones = new Map();

      textosUnicos.forEach((textoOriginal, index) => {
        mapaTraducciones.set(textoOriginal, traducciones[index]);
      });

      // =====================================================
      // Reemplazar textos
      // =====================================================

      nodosTraducibles.forEach((nodo) => {
        const original = textosOriginales.current.get(nodo);

        if (!original) {
          return;
        }

        const traduccion = mapaTraducciones.get(original.trim());

        if (traduccion) {
          nodo.textContent = traduccion;
        }
      });
    };

    traducirPagina();

    return () => {
      cancelado = true;
    };
  }, [idioma]);

  return null;
}

// =========================================================
// OBTENER TEXTOS DEL DOM
// =========================================================

function obtenerNodosTexto() {
  const nodos = [];

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const padre = node.parentElement;

        if (!padre) {
          return NodeFilter.FILTER_REJECT;
        }

        // Elementos que NO queremos traducir
        const elementosIgnorados = [
          "SCRIPT",
          "STYLE",
          "NOSCRIPT",
          "CODE",
          "PRE",
          "INPUT",
          "TEXTAREA",
          "OPTION",
          "AUDIO",
        ];

        if (elementosIgnorados.includes(padre.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        const texto = node.textContent.trim();

        if (!texto) {
          return NodeFilter.FILTER_REJECT;
        }

        // Evitar textos demasiado raros
        if (texto.length < 2) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let nodo;

  while ((nodo = walker.nextNode())) {
    nodos.push(nodo);
  }

  return nodos;
}
