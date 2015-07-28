var router = require('koa-router')()
  , passport = require('koa-passport')
;

require('./auth');

router
  .post('/login', require('./oauth2').login)
  .post('/token', require('./oauth2').token)
  .post('/logout', require('./oauth2').logout)
  .post('/user', function* () {

    var credential = {
      provider: 'local',
      email: this.request.body.email || '',
      password: this.request.body.password || ''
    };

    var user = {
      some: 'stuff'
    };

    try {
      var u = yield this.models.user.create(user);
      credential._user = u.id; // TODO: when migrating to other dbs make sure `id` is right
      var c = yield this.models.credential.create(credential);

    } catch (err){
      console.log('credential/user error', err, credential, user);

      // Clean up orphan user
      if (u) yield u.destroy(); // Do I need to try/catch destroy also??

      if (err.message === '[Error (E_UNKNOWN) Encountered an unexpected error] Details:  AdapterError: Record does not satisfy unique constraints\n') // TODO: implement proper uniqueness checking (http://stackoverflow.com/questions/22868420/how-do-i-handle-a-unique-field-in-sails)
        this.status = 409;
      else
        this.status = 400;

      this.body = err;
      return;
    }

    // TODO: make wrapper for login/user so I don't have to manually interact with separate entities


    this.status = 200;
    this.body = [u, c];
  })

  // GITHUB
  .get('/auth/github', passport.authenticate('github'))
  .get('/auth/github/callback',
    passport.authenticate('github', { successRedirect: '/success',
                                      failureRedirect: '/failure' }))
;

module.exports = {
  router: router,
  models: require('./model-loader')
};
