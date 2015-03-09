var Waterline = require('waterline');
var orm = new Waterline();

var redis = require('sails-redis');

const config = {

  // Setup Adapters
  // Creates named adapters that have have been required
  adapters: {
    'default': redis,
    redis: redis
  },

  // Build Connections Config
  // Setup connections using the named adapter configs
  connections: {
    redis: {
      adapter: 'redis'
    }
  }
};

module.exports=function(app, models){
  models.forEach((model) => {
    orm.loadCollection(model);
  });
  
  orm.initialize(config, function(err, db) {
    if (err) throw err;
    app.context.models = db.collections;
  });
  return orm;
}



// var Waterline = require('waterline');
// var orm = new Waterline();
// var Promise = require('bluebird');

// var redis = require('sails-redis');

// const config = {

//   // Setup Adapters
//   // Creates named adapters that have have been required
//   adapters: {
//     'default': redis,
//     redis: redis
//   },

//   // Build Connections Config
//   // Setup connections using the named adapter configs
//   connections: {
//     redis: {
//       adapter: 'redis'
//     }
//   }
// };

// module.exports = function(models) {
//   return function* (next) {
//     models = [].concat.apply([], models); //flatten
//     models.map( model => orm.loadCollection(model) );

//     orm.initialize = Promise.promisify(orm.initialize);
//     this.models = yield orm.initialize(config);

//     yield next;
//   }
// };