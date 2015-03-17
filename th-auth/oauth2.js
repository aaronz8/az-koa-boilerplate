var oauth2orize = require('koa-oauth2orize');
var passport = require('koa-passport');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var compose = require('koa-compose');
var co = require('co');
var Promise = require('bluebird');

var config = require('../config');

// var User = require('../model/user');

// create OAuth 2.0 server
var aserver = oauth2orize.createServer();

// Destroys any old tokens and generates a new access and refresh token
function generateTokens (client, user) {

  const accessTokenPayload = {
    user: user,
    type: "accessToken",
    jti: crypto.randomBytes(32).toString('base64') // differentiates accesstoken and refreshtoken
  };

  const refreshTokenPayload = {
    type: "refreshToken",
    jti: crypto.randomBytes(32).toString('base64') // differentiates accesstoken and refreshtoken
  };

  const accessTokenOptions = {
    subject: user._id,
    issuer: "th3",
    expiresInMinutes: config.get('security:accessTokenLife')
  };

  const refreshTokenOptions = {
    subject: user._id,
    issuer: "th3",
    expiresInMinutes: config.get('security:refreshTokenLife')
  };

  return {
    access: jwt.sign(accessTokenPayload, config.get('security:jwtSecret'), accessTokenOptions),
    refresh: jwt.sign(refreshTokenPayload, config.get('security:jwtSecret'), refreshTokenOptions)
  };
};

// Exchange username & password for access token.
// test: http POST http://localhost:3000/token client_id=th3official grant_type=password client_secret=asdf username=un password=passwo
aserver.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
  // try {
  //   const user = yield User.findOne({ username: username }).exec();
  // } catch (err) {
  //   return done(err);
  // }
  user = {_id:"user id", authenticate:function(){return true}}; //mock

  if (!user || !user.authenticate(password)) { 
    return done(null, false); 
  }

  var tokens = generateTokens(client, user);

  return done(null, tokens.access, tokens.refresh, {
    'expires_in': config.get('security:tokenLife')
  });

}));

// Exchange refreshToken for new access and refresh tokens.
// test: http POST http://localhost:3000/token client_id=th3official grant_type=refresh_token client_secret=asdf refresh_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkIjoxNDI1NzE1MTM4MDkyLCJ0b2tlbiI6IjI4Wk01M1NRY2pZUCswcUU4U01pNVlXb3dzdkdyMkN5UnpDSXFJRWpiRm89IiwiaWF0IjoxNDI1NzE1MTM4fQ.mUBSwcBrBcC6Ys8XhXrkugJ-ZkiYME6bYAZVIramLbs"
aserver.exchange(oauth2orize.exchange.refreshToken(function (client, refreshTokenJWT, scope, done) {
  const app = require('../index');

  co(function* () {
    try {
      const refreshToken = jwt.verify(refreshTokenJWT, config.get('security:jwtSecret'));
    } catch (err) {
      return done(null, false);
    }

    if (refreshToken.type !== "refreshToken") {
      return done(null, false);
    }

    // TODO: check if IP address and clientID match
    
    // if refreshToken is in redis, then invalidate refreshToken (user has logged out or has been replaced by another refreshToken)
    const invalidRefreshToken = yield app.context.models.refreshtoken.findOne({ jti:refreshToken.jti });
    if (invalidRefreshToken) {
      return done(null, false);
    }

    // try {
    //   const user = yield User.findById(refreshToken.sub).exec();
    // } catch (err) {
    //   return done(err);
    // }
    user = {_id:"user id"}

    if (!user) { 
      done(null, false); 
    }

    // Invalidate previously valid refreshToken
    yield app.context.models.refreshtoken.create(refreshToken);

    // Return new tokens
    const tokens = generateTokens(client, user);
    done(null, tokens.access, tokens.refresh, {
      'expires_in': config.get('security:accessTokenLife')
    });

  }).catch((err) => {
    done(err);
    console.log(err);
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

// login endpoint
// 
// Only for first party client!
exports.login = compose([
  aserver.errorHandler(),
  function*(next) {
    this.request.body.grant_type = "password";
    yield next;
  },
  aserver.token()
]);

// logout endpoint
// 
// add refreshToken to redis to invalidate it from generating new accessTokens
// Always returns statusCode:200 and empty body
exports.logout = function* () {
  try {
    const refreshToken = jwt.verify(this.request.body.refresh_token, config.get('security:jwtSecret'));

    if (refreshToken.type === "refreshToken") {
      // Invalidate refreshToken if previously valid
      yield this.models.refreshtoken.create(refreshToken)
    }
  } catch (ignore){
    // ignore if invalid refreshToken or duplicate refreshToken in db
  } 

  this.statusCode = 200;
  this.body = '';
};