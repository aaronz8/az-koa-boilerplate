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
  .post('/logout', require('./oauth2').logout)
  .post('/user', function* () {
    var credential = {
      provider: 'local',
      email: '3@z.com',
      password: '3',
      _user: {profile: {lol: 'lolll'}}
    };

    try {
      yield this.models.credential.create(credential);

    } catch (err){
      console.log(err);
    }

    this.statusCode = 200;
    this.body = credential;
  })
;

module.exports = {
  middleware: auth,
  models: require('./model-loader')
};
