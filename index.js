// dependencies
var debug      = require('debug')('th3')
  , logger     = require('koa-logger')
  , router     = require('koa-router')
  , mount      = require('koa-mount')
  , cors       = require('koa-cors')
  , favicon    = require('koa-favicon')
  , bodyParser = require('koa-bodyparser')
  , passport   = require('koa-passport')
  , koa        = require('koa')
  , app        = module.exports = koa()
  
  , thAuth     = require('./th-auth')
;

// database
// TODO: fix this so models can be loaded from several places
require('./database')(app, [require('./th-auth/models/refresh-token-model')]);
//app.use(require('./database')(thAuth.models));


// middleware
app.use(logger());
app.use(bodyParser());
app.use(passport.initialize());
app.use(cors({ origin:true, credentials:true }));
app.use(router(app));
app.use(favicon(__dirname + '/public/favicon.ico'));

// Modules
app.use(mount('/oauth2', thAuth.middleware));

// API routes
app.get('/', passport.authenticate("bearer", { session: false }), function*() {
  this.body="here";
});

// error handler
app.on('error', function(err){
  if (process.env.NODE_ENV !== 'test') {
    console.log('sent error %s to the cloud', err.message);
    console.log(err.stack);
  }
});

if (!module.parent) {
  app.listen(3000);
  console.log('listening on port 3000');
}