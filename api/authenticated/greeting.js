import * as jose from 'jose';

export const config = {
  runtime: 'edge',
};

const JWKS_URI = 'https://keycloak.authjs.dev/realms/master/protocol/openid-connect/certs';
const ISSUER = 'https://keycloak.authjs.dev/realms/master';
const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://next-auth-example.vercel.app'];

async function verifyToken(token) {
  try {
    const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));
    return await jose.jwtVerify(token, JWKS, {
      issuer: ISSUER,
      algorithms: ['RS256'],
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

function corsHeaders(origin) {
  const headers = new Headers();
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  return headers;
}

export default async function handler(req) {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return Response.json(null, { headers: corsHeaders(origin) });
  }

  const url = new URL(req.url);

  if (url.pathname === '/api/public/greeting') {
    return Response.json(
      { greeting: 'Greetings, mysterious traveller.' },
      { headers: corsHeaders(origin) }
    );
  }

  if (url.pathname === '/api/authenticated/greeting') {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json('Unauthorized', { status: 401, headers: corsHeaders(origin) });
    }

    const token = authHeader.split(' ')[1];
    const verifiedToken = await verifyToken(token);

    if (!verifiedToken) {
      return Response.json('Invalid token', { status: 401, headers: corsHeaders(origin) });
    }

    const name = verifiedToken.payload.name || 'unknown name';
    return Response.json(
      { greeting: `Hello, ${name}!` },
      { headers: corsHeaders(origin) }
    );
  }

  return Response.json('Not Found', { status: 404, headers: corsHeaders(origin) });
}