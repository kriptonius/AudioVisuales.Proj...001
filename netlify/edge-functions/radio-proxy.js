// netlify/edge-functions/radio-proxy.js
//
// Versión correcta para radio EN VIVO. La diferencia clave con una Netlify
// Function clásica: esto reenvía el audio en streaming real, byte a byte,
// sin esperar a que el stream "termine" (una radio en vivo nunca termina,
// por eso la función clásica se hubiera colgado).
//
// Soluciona el bloqueo de "contenido mixto": tu sitio va por HTTPS (Netlify),
// pero si el stream original de la radio es http://, el navegador lo bloquea.
// Esta Edge Function pide el stream desde el servidor y se lo reenvía
// al navegador ya como HTTPS.
//
// Cómo instalarla:
// 1. Crea la carpeta netlify/edge-functions/ en la raíz de tu repo (junto al HTML)
// 2. Copia este archivo ahí, tal cual, como radio-proxy.js
// 3. Sube los cambios a tu repo conectado a Netlify (Edge Functions se activan
//    solo con tener el archivo en esa carpeta — no necesitas netlify.toml para esto,
//    Netlify lo detecta automático por el "export const config" de abajo)
// 4. Verifica que quedó activa en:
//    https://TU-SITIO.netlify.app/radio-proxy?url=http://LA-URL-DEL-STREAM

export default async (request) => {
  const url = new URL(request.url);
  const streamUrl = url.searchParams.get("url");

  if (!streamUrl || !streamUrl.startsWith("http://")) {
    return new Response("Falta el parámetro ?url= con un stream http:// válido", { status: 400 });
  }

  try {
    const upstream = await fetch(streamUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RadioProxy/1.0)" },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("No se pudo conectar al stream original", { status: 502 });
    }

    // Reenvía el cuerpo tal cual llega, en streaming — sin buffer, sin cortes.
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response("Error al conectar con el stream: " + err.message, { status: 502 });
  }
};

export const config = { path: "/radio-proxy" };
