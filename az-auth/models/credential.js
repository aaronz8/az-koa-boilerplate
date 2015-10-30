// Credentials
// http://ganeshdatta.com/2015/03/01/waterline-orm-in-express-the-correct-way/
var crypto = require('crypto')
  , Waterline = require('waterline')
;

var _providers = ['github']; // 'google', 'facebook', 'twitter', 'github', 'bamboohr', 'okta'

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

  types: {
    password: function(password) {
      // invalidate if password with non-local provider
      if (this.provider !== 'local') return (typeof password === 'undefined');

      if (password.length < 8) return false;
      return /[A-Z]/.test(password) && /[0-9]/.test(password);
    },

    myemail: function(email) {
      // invalidate if email with non-local provider
      if (this.provider !== 'local') return (typeof email === 'undefined');

      return email && validator.isEmail(email);
    }
  },

  attributes: {
    provider: {
      required: true,
      type: 'string',
      enum: _providers
    },

    email: {
      type: 'string',
      myemail: true
    },

    password: {
      type: 'string',
      password: true
    },

    salt: {
      type: 'string'
    },

    // 3rd-party logins
    uid: {
      type: 'string',
      // unique: true
      //sparse: true
    },

    accessToken: {
      type: 'string'
    },

    _user: {
      model: 'user'
    },

    authenticate: function(plainText) {
      return (_encryptPassword(this.salt, plainText) === this.password);
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      delete obj.salt;
      return obj;
    }
  },

  beforeValidate: function(values, next) {
    if (values.email) 
      values.email = values.email.toLowerCase().trim;

    next();
  },

  afterValidate: function(values, next) {
    if (values.password) {
      values.salt = _makeSalt();
      values.password = _encryptPassword(values.salt, values.password);
    }

    next();
  }
});

module.exports = Credential;
