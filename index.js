// dependencies
var path       = require('path')
  , debug      = require('debug')('az')
  , logger     = require('koa-logger')
  , router     = require('koa-router')
  , mount      = require('koa-mount')
  , cors       = require('koa-cors')
  , favicon    = require('koa-favicon')
  , bodyParser = require('koa-bodyparser')
  , passport   = require('koa-passport')
  , app        = module.exports = require('koa')()
;

// modules
var azAuth     = require('./az-auth')
;

// database
// TODO: fix this so models can be loaded from several places
// require('./database')(app, [require('./az-auth/models/refresh-token-model')]);
//app.use(require('./database')(azAuth.models));
require('./database')(app, azAuth.models);

// middleware
app.use(logger());
app.use(bodyParser());
app.use(passport.initialize());
app.use(cors({ origin: true, credentials: true, headers: ['authorization', 'content-type', 'accept'] }));
app.use(router(app));
app.use(favicon(path.resolve(__dirname, 'public/favicon.ico')));

// Modules
app.use(mount('/oauth2', azAuth.middleware));

// API routes
app.get('/', passport.authenticate('bearer', { session: false }), function*() {
  this.body = 'here';
});

// error handler
app.on('error', function(err){
  if (process.env.NODE_ENV !== 'test') {
    console.log('sent error %s to the cloud', err.message);
    console.log(err.stack);
    debug(err.stack);
  }
});

if (!module.parent) {
  app.listen(3000);
  console.log('listening on port 3000');
}
