const jwt                    = require('jsonwebtoken')
    , passport               = require('koa-passport')
    , BasicStrategy          = require('passport-http').BasicStrategy
    , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
    , BearerStrategy         = require('passport-http-bearer').Strategy
;

const config = require('../config');

// Authenticate client
// (registered but untrusted since anyone can discover and spoof clientid+secret from web app)
function authenticateClient(clientId, clientSecret, done) {
  if (clientId === 'th3official') { return done(null, {client: 'this is a client', _id: 'th3official'}); }
}

// Authenticate client
passport.use(new BasicStrategy(authenticateClient));
passport.use(new ClientPasswordStrategy(authenticateClient));

passport.use(new BearerStrategy(function(accessTokenJWT, done) {
  // Verify accessTokenJWT and expiration
  let accessToken;
  try {
    accessToken = jwt.verify(accessTokenJWT, config.get('security:jwtSecret'));
  } catch (err) {
    return done(null, false, { message: 'Invalid access_token'});
  }

  if ( accessToken.type !== 'accessToken' ) {
    return done(null, false, { message: 'Invalid access_token'});
  }

  const user = accessToken.user;
  // caveat: user might not be in sync with db (but doesn't matter if new accessToken issued to replace outdated one)

  var info = { scope: '*' };
  done(null, user, info);
}));
