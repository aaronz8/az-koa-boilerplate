var co                     = require('co')
  , jwt                    = require('jsonwebtoken')
  , passport               = require('koa-passport')
  , BasicStrategy          = require('passport-http').BasicStrategy
  , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
  , BearerStrategy         = require('passport-http-bearer').Strategy
;

var config = require('../config');

//var User = require('../model/user');
//var AccessToken = require('../model/accessToken');
//var RefreshToken = require('../model/refreshToken');

// Authenticate client
// (registered but untrusted since anyone can discover and spoof clientid+secret from web app)
function authenticateClient(clientId, clientSecret, done) {
  console.log("authenticateClient");
  if (clientId === "th3official") { return done(null, {client: "this is a client", _id: "th3official"}); }
  // try {
  //   var client = yield Client.findOne({ clientId: clientId, clientSecret: clientSecret }).exec();
  //   if (!client) { return done(null, false); }
  //   return done(null, client);
  // } catch (err) {
  //   return done(err);
  // }
}

// Authenticate client
passport.use(new BasicStrategy(authenticateClient));
passport.use(new ClientPasswordStrategy(authenticateClient));

// 1. unpack accesstoken jwt
// 2. If expired, return 401 "token expired"
// 3. If not expired, fetch and return user
passport.use(new BearerStrategy(
  function(accessTokenJWT, done) {
    try {
      const accessToken = jwt.verify(accessTokenJWT, config.get('security:jwtSecret'));
    } catch (err) {
      return done(null, false, { message: 'Invalid access_token'});
    }

    // { _client: 'th3official',
    //   iat: 1425773036,
    //   exp: 1425989036,
    //   iss: 'th3',
    //   sub: 'user id' }
  
    // If expired, return "token expired"
    if( accessToken.exp < Date.now()/1000 ) {
      return done(null, false, { message: 'Token expired' });
    }

    try {
      const user = {lol:true}//yield User.findById(accessToken.sub).exec();
    } catch (err) {
      return done(err);
    }

    if (!user) { return done(null, false, { message: 'Unknown user' }); }

    var info = { scope: '*' };
    done(null, user, info);
  }
));