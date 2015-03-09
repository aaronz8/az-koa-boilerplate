var mount = require('koa-mount')
  , router = require('koa-router')
  , passport = require('koa-passport')
  , koa = require('koa')
  , auth = koa()
;

require('./auth');

auth
  .use(router(auth))
  .post('/token', require('./oauth2').token)
  .post('/logout', require('./oauth2').logout);

module.exports = {
  middleware: auth,
  models: require('./model-loader')
};