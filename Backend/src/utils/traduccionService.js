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

  const idiomasPermitidos = ["ES", "EN"];

  if (
    !idiomasPermitidos.includes(idiomaOrigen) ||
    !idiomasPermitidos.includes(idiomaDestino)
  ) {
    throw new Error("Solo se permite traducir entre español e inglés.");
  }

  if (idiomaOrigen === idiomaDestino) {
    throw new Error("El idioma de origen y destino deben ser diferentes.");
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
