// dependencies
var debug   = require('debug')('th3')
  , logger  = require('koa-logger')
  , router  = require('koa-router')
  , mount = require('koa-mount')
  , cors    = require('koa-cors')
  , favicon = require('koa-favicon')
  , bodyParser = require('koa-bodyparser')
  , passport = require('koa-passport')
  , koa     = require('koa')
  , app     = module.exports = koa()
;

// database


// middleware
app.use(logger());
app.use(bodyParser());
app.use(passport.initialize());
app.use(router(app));
app.use(cors({ origin:true, credentials:true }));
app.use(favicon(__dirname + '/public/favicon.ico'));


require('./auth');

// API routes
app.post('/token', require('./auth/oauth2').token);

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