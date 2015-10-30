// User Account

const Waterline = require('waterline');

const User = Waterline.Collection.extend({

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

    // addCredential: function*(credential) {
    //   return;
    // }
  },

  /**
   * Create new User with new Credential (Must call with context)
   * @example yield this.models.user.createWithCredential.call(this, {a:'stuff'}, {});
   * @param {Object} user          New user object
   * @param {Object} credential    New credential object
   * @return {Object} {user, credential}
   */
  createWithCredential: function*(user, credential) {
    'use strict';
    let newUser, newCredential;
    try {
      newUser = yield this.models.user.create(user);
      credential._user = newUser.id;
      newCredential = yield this.models.credential.create(credential);
    } catch (err){
      // Clean up orphan user
      if (newUser) yield newUser.destroy();

      // Pass on error to caller
      throw new Error(err);
    }

    return {user: newUser, credential: newCredential};
  }
});

module.exports = User;
