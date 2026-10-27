// Cloudflare Worker: minimal CORS proxy for the Discord REST API (used by TodaMaxTipid Gold POS).
// Deploy at workers.cloudflare.com, then set API Base URL in the POS to:  https://<your-worker>.workers.dev/api/v10
// Only forwards /api/v10/channels/... and /api/v10/users/@me. Your bot token is sent by the POS in the Authorization header.
export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (!/^\/api\/v10\/(channels\/\d+(\/messages(\/\d+)?)?|users\/@me)$/.test(url.pathname)) {
      return new Response('Not allowed', { status: 403, headers: cors });
    }
    const upstream = await fetch('https://discord.com' + url.pathname + url.search, {
      method: request.method,
      headers: { 'Authorization': request.headers.get('Authorization') || '', 'Content-Type': request.headers.get('Content-Type') || 'application/json' },
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body
    });
    const headers = new Headers(upstream.headers);
    Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
    return new Response(upstream.body, { status: upstream.status, headers });
  }
};
