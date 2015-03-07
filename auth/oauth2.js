var oauth2orize = require('koa-oauth2orize');
var passport = require('koa-passport');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var compose = require('koa-compose');

var config = require('../config');

// var db = require('../db/mongoose');
// var User = require('../model/user');

// create OAuth 2.0 server
var aserver = oauth2orize.createServer();

// Destroys any old tokens and generates a new access and refresh token
var generateToken = function (client, user) {

  const payload = {
    _user: user._id,
    _client: client._id,
    created: Date.now(),
    token: crypto.randomBytes(32).toString('base64')
  }
  return jwt.sign(payload, config.get('security:jwtSecret'));







  // // curries in `done` callback so we don't need to pass it
  //   var errorHandler = errFn.bind(undefined, done), 
  //     refreshToken,
  //     refreshTokenValue,
  //     token,
  //     tokenValue;

  //   RefreshToken.remove(data, errorHandler);
  //   AccessToken.remove(data, errorHandler);

  //   tokenValue = crypto.randomBytes(32).toString('base64');
  //   refreshTokenValue = crypto.randomBytes(32).toString('base64');

  //   data.token = tokenValue;
  //   token = new AccessToken(data);

  //   data.token = refreshTokenValue;
  //   refreshToken = new RefreshToken(data);

  //   refreshToken.save(errorHandler);

  //   token.save(function (err) {
  //     if (err) {
      
  //       log.error(err);
  //         return done(err); 
  //     }
  //     done(null, tokenValue, refreshTokenValue, { 
  //       'expires_in': config.get('security:tokenLife') 
  //     });
  //   });
};

// Exchange username & password for access token.
aserver.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
  // try {
  //   const user = yield User.findOne({ username: username }).exec();
  // } catch (err) {
  //   return done(err);
  // }
  user = {user:"me"}

  // if (!user || !user.checkPassword(password)) { return done(null, false); }

  var accessToken = generateToken(client, user);
  var refreshToken = generateToken(client, user);

  return done(null, accessToken, refreshToken, {
    'expires_in': config.get('security:tokenLife')
  });

}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refreshTokenJWT, scope, done) {
  const refreshToken = jwt.verify(refreshTokenJWT, config.get('security:jwtSecret'));

  // TODO: check if IP address and clientID match
  if (!refreshToken) return done(null, false);

  // try {
  //   const user = yield User.findById(refreshToken._user).exec();
  // } catch (err) {
  //   return done(err);
  // }

  // if (!user) { return done(null, false); }

  // TODO: if (refreshToken.created < user.lastLogout ) don't provide access token for client. check clientId matches

  var accessToken = generateToken(client, user);
  var refreshToken = generateToken(client, user);

  return done(null, accessToken, refreshToken, {
    'expires_in': config.get('security:tokenLife')
  });
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = compose([
  aserver.errorHandler(),
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  aserver.token()
]);