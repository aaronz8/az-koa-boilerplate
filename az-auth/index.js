var router = require('koa-router')()
  , passport = require('koa-passport')
;

require('./auth');

router
  .post('/login', require('./oauth2').login)
  .post('/token', require('./oauth2').token)
  .post('/logout', require('./oauth2').logout)
  .post('/user', require('./controllers/create-user'))

  // GITHUB
  .get('/github', passport.authenticate('github', {scope: ['write:repo_hook']}))
  .get('/github/callback',
    passport.authenticate('github', { successRedirect: '/repos',
                                      failureRedirect: '/failure' }))
;

module.exports = {
  router: router,
  models: require('./model-loader')
};
