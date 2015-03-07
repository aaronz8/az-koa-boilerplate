var passport = require('koa-passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var co = require('co');

var jwt = require('jsonwebtoken');
var config = require('../config');

//var User = require('../model/user');
//var AccessToken = require('../model/accessToken');
//var RefreshToken = require('../model/refreshToken');

// Authenticate client
// (registered but untrusted since anyone can discover and spoof clientid+secret from web app)
function authenticateClient(clientId, clientSecret, done) {
  console.log("authenticateClient");
  if (clientId === "th3official") { return done(null, {client: "this is a client"}); }
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
    console.log("bearerstrategy");
    // return co(function*(accessTokenJWT, done) {
    //   const accessToken = jwt.verify(accessTokenJWT, config.get('security:jwtSecret'));
    //   if (!accessToken) return done(null, false);

    //   // If expired, return "token expired"
    //   if( Math.round((Date.now()-accessToken.created)/1000) > config.get('security:tokenLife') ) {
    //     return done(null, false, { message: 'Token expired' });
    //   }

    //   try {
    //     const user = {lol:true}//yield User.findById(accessToken._user).exec();
    //   } catch (err) {
    //     return done(err);
    //   }

    //   if (!user) { return done(null, false, { message: 'Unknown user' }); }

    //   var info = { scope: '*' };
    //   done(null, user, info);
    // })
  }
));