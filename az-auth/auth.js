'use strict';

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
  if (clientId === 'th3official')
    return done(null, {client: 'this is a client', _id: 'th3official'});
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

  if ( accessToken.type !== 'accessToken' )
    return done(null, false, { message: 'Invalid access_token'});

  const user = accessToken.user;
  // caveat: user might not be in sync with db (but doesn't matter if new accessToken issued to replace outdated one)

  var info = { scope: '*' };
  done(null, user, info);
}));


// GITHUB
// TODO: Move into config file so az-auth can be split off
const GithubStrategy  = require('passport-github').Strategy;

passport.use(new GithubStrategy({
  clientID: config.get('security:github:clientID'),
  clientSecret: config.get('security:github:clientSecret'),
  passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {

  const app = require('../index');
  const User = app.context.models.user;
  const Credential = app.context.models.credential;

  Credential.findOrCreate({
    provider: 'github', 
    uid: profile.id
  })
  .then( credential => {
    // Get existing credential + user
    if (credential._user)
      if (req.user && req.user._id !== credential._user )
        return done('Logged in user is different from user associated with these Github credentials.');
      else
        return done(null, credential._user);

    // Get new credential + update/create user
    else
      if (req.user) {
        credential._user = req.user.id;
        return credential.save()
        .then( () => {
          return done(null, credential._user);
        });
      } else
        return User.create({
          profile: profile
        })
        .then( user => {
          credential._user = user.id;
          return credential.save();
        })
        .then( () => {
          return done(null, credential._user);
        });
  })
  .catch( err => {
    // TODO: if user or credential, delete
    return done(err);
  });

}));

passport.serializeUser(function(id, done) {
  done(null, id);
});

passport.deserializeUser(function(id, done) {
  const app = require('../index');
  const User = app.context.models.user;
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
