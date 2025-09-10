export default defineEventHandler((event) =>
{
  const reqOrigin = getHeader(event, 'origin');
  const serverOrigin = `${event.node.req.headers['x-forwarded-proto'] || 'http'}://${event.node.req.headers.host}`;

  if (reqOrigin && reqOrigin !== serverOrigin)
  {
    // Block cross-origin requests
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': 'null',
    });
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Cross-Origin Access Denied',
    });
  }

  // Allow same-origin requests
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': serverOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  });
});