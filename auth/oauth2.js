var oauth2orize = require('koa-oauth2orize');
var passport = require('koa-passport');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var compose = require('koa-compose');
var co = require('co');
var Promise = require('bluebird');

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
    created: Date.now(), // redundant, jwt adds iat already
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
// test: http POST http://localhost:3000/token client_id=th3official grant_type=password client_secret=asdf username=un password=passwo
aserver.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
  // try {
  //   const user = yield User.findOne({ username: username }).exec();
  // } catch (err) {
  //   return done(err);
  // }
  user = {_id:"user id"}

  // if (!user || !user.checkPassword(password)) { return done(null, false); }

  var accessToken = generateToken(client, user);
  var refreshToken = generateToken(client, user);

  return done(null, accessToken, refreshToken, {
    'expires_in': config.get('security:tokenLife')
  });

}));

// Exchange refreshToken for access token.
// test: http POST http://localhost:3000/token client_id=th3official grant_type=refresh_token client_secret=asdf refresh_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkIjoxNDI1NzE1MTM4MDkyLCJ0b2tlbiI6IjI4Wk01M1NRY2pZUCswcUU4U01pNVlXb3dzdkdyMkN5UnpDSXFJRWpiRm89IiwiaWF0IjoxNDI1NzE1MTM4fQ.mUBSwcBrBcC6Ys8XhXrkugJ-ZkiYME6bYAZVIramLbs"
const refreshToken = Promise.promisify(oauth2orize.exchange.refreshToken);
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refreshTokenJWT, scope, done) {
  co(function* () {
    console.log("here");
    const refreshToken = jwt.verify(refreshTokenJWT, config.get('security:jwtSecret'));
    // TODO: check if IP address and clientID match
    if (!refreshToken) return done(null, false);
  user = {_id:"user id"}

    // try {
    //   const user = yield User.findById(refreshToken._user).exec();
    // } catch (err) {
    //   return done(err);
    // }

    // if (!user) { return done(null, false); }

    // TODO: if (refreshToken.created < user.lastLogout/expire ) don't provide access token for client. check clientId matches

    var accessToken = generateToken(client, user);
    var refreshTokenx = generateToken(client, user);

    return done(null, accessToken, refreshTokenx, {
      'expires_in': config.get('security:tokenLife')
    });
  }).catch(function(err) {
    console.error(err.stack);
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