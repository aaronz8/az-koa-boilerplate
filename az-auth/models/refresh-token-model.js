// RefreshToken blacklist
// TODO: automatically delete expired tokens

var Waterline = require('waterline');

var RefreshToken = Waterline.Collection.extend({

  identity: 'refreshtoken',

  connection: 'redis',

  attributes: {
    _client: {
      type: 'string'
    },
    iat: {
      type: 'string'
    },
    exp: {
      type: 'string'
    },
    iss: {
      type: 'string'
    },
    sub: {
      type: 'string'
    },
    jti: {
      type: 'string',
      unique: true
    }
  }
});

module.exports = RefreshToken;


// TODO: turn iat and exp into dates
