import * as deepl from "deepl-node";

const authKey = process.env.DEEPL_API_KEY;

if (!authKey) {
  throw new Error(
    "DEEPL_API_KEY no está configurada en las variables de entorno.",
  );
}

const deeplClient = new deepl.DeepLClient(authKey);

export const traducirTexto = async (texto, idiomaOrigen, idiomaDestino) => {
  if (!texto || !texto.trim()) {
    throw new Error("El texto a traducir es obligatorio.");
  }

  const idiomaOrigenDeepL = idiomaOrigen === "ES" ? "es" : "en";

  const idiomaDestinoDeepL = idiomaDestino === "ES" ? "es" : "en-US";

  const resultado = await deeplClient.translateText(
    texto,
    idiomaOrigenDeepL,
    idiomaDestinoDeepL,
  );

  return resultado.text;
};

export const traducirTextos = async (textos, idiomaOrigen, idiomaDestino) => {
  if (!Array.isArray(textos) || textos.length === 0) {
    throw new Error("Debe proporcionar una lista de textos.");
  }

  const idiomaOrigenDeepL = idiomaOrigen === "ES" ? "es" : "en";

  const idiomaDestinoDeepL = idiomaDestino === "ES" ? "es" : "en-US";

  const resultados = await deeplClient.translateText(
    textos,
    idiomaOrigenDeepL,
    idiomaDestinoDeepL,
  );

  return resultados.map((resultado) => resultado.text);
};
