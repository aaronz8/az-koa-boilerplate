var router = require('koa-router')
  , koa = require('koa')
  , auth = koa()
;
require('koa-passport');

require('./auth');

auth
  .use(router(auth))
  .post('/login', require('./oauth2').login)
  .post('/token', require('./oauth2').token)
  .post('/logout', require('./oauth2').logout);

module.exports = {
  middleware: auth,
  models: require('./model-loader')
};
