// Credentials
// http://ganeshdatta.com/2015/03/01/waterline-orm-in-express-the-correct-way/
var crypto = require('crypto')
  , Waterline = require('waterline')
;

var _providers = ['local']; // 'google', 'facebook', 'twitter', 'github', 'bamboohr', 'okta'

function _makeSalt () {
  return crypto.randomBytes(16).toString('base64');
}

function _encryptPassword (salt, password) {
  var saltBuffer = new Buffer(salt, 'base64');
  return crypto.pbkdf2Sync(password, saltBuffer, 10000, 64).toString('base64');
}

var Credential = Waterline.Collection.extend({

  identity: 'credential',

  connection: 'redis',

  attributes: {
    provider: {
      type: 'string',
      enum: _providers
    },

    email: {
      type: 'email',
      unique: true
      // lowercase: true
      // sparse: true
    },

    hashedPassword: {
      type: 'string'
    },

    salt: {
      type: 'string'
    },

    // 3rd-party logins
    key: {
      type: 'string',
      unique: true
      //sparse: true
    },

    _user: {
      model: 'user'
    },

    authenticate: function(plainText) {
      return (_encryptPassword(this.salt, plainText) === this.hashedPassword);
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.hashedPassword;
      delete obj.salt;
      return obj;
    }
  },

  // TODO: consider 3rd party login cases and update cases. before/afterValidate
  beforeCreate: function(values, next) {
    if (values.provider === 'local') {
      if (!values.email) next('Email cannot be blank'); // TODO check for valid email?
      if (!values.password && !values.hashedPassword) next('Password cannot be blank');
    }
    if (values.password) {
      values.salt = _makeSalt();
      values.hashedPassword = _encryptPassword(values.salt, values.password);
      delete values.password;
    }

    next();
  }
});

module.exports = Credential;
