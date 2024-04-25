const express = require('express');
var { expressjwt: jwt } = require("express-jwt");
const jwks = require('jwks-rsa');
const cors = require('cors');

const app = express();

// Middleware to enable CORS
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware for JWT validation
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://keycloak.authjs.dev/realms/master/protocol/openid-connect/certs'
  }),
  issuer: 'https://keycloak.authjs.dev/realms/master',
  algorithms: ['RS256']
});

// Public greeting endpoint
app.get('/api/public/greeting', (req, res) => {
  res.json({ greeting: 'Greetings, mysterious traveller.' });
});

// Authenticated greeting endpoint
app.get('/api/authenticated/greeting', jwtCheck, (req, res) => {
  const name = req.user && req.user.name ? req.user.name : 'unknown name';
  res.json({ greeting: `Hello, ${name}!` });
});

// Error handling for JWT validation
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

const port = 8081;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
