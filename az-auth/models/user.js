// User Account

var Waterline = require('waterline');

var User = Waterline.Collection.extend({

  identity: 'user',

  connection: 'redis',

  attributes: {
    profile: {
      type: 'json'
    },

    _credentials: {
      collection: 'credential',
      via: '_user'
    }
  }
});

module.exports = User;
