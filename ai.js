// ============================================================
// Netlify Serverless Function — Proxy para API de Anthropic
// La API key vive aquí (en el servidor), nunca en el frontend
// ============================================================

exports.handler = async function(event, context) {
  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Lee la API key desde variables de entorno de Netlify
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key no configurada en Netlify' })
    };
  }

  try {
    // Parsear el body que manda el frontend
    const body = JSON.parse(event.body);
    const { messages, max_tokens = 1000 } = body;

    // Llamar a la API de Anthropic desde el servidor
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        messages
      })
    });

    const data = await response.json();

    // Devolver la respuesta al frontend
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error interno: ' + error.message })
    };
  }
};
