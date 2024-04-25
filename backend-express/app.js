const express = require('express');
var { expressjwt: jwt } = require("express-jwt");
const jwks = require('jwks-rsa');
const cors = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'https://next-auth-example.vercel.app'] }));

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

app.get('/api/public/greeting', (req, res) => {
  res.json({ greeting: 'Greetings, mysterious traveller.' });
});

app.get('/api/authenticated/greeting', jwtCheck, (req, res) => {
  const name = req.auth && req.auth.name ? req.auth.name : 'unknown name';
  res.json({ greeting: `Hello, ${name}!` });
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

const port = 8081;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
