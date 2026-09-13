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

  const resultado = await deeplClient.translateText(
    texto,
    idiomaOrigen,
    idiomaDestino,
  );

  return resultado.text;
};
