module.exports = function*() {
  'use strict';
  let credential = {
    provider: 'local',
    email: this.request.body.email,
    password: this.request.body.password
  };

  let existingUser = yield this.models.credential.findOne({
    provider: 'local',
    email: credential.email
  });
  if (existingUser) {
    this.status = 409;
    this.body = 'User with email already exists';
    return;
  }

  let user = {
    some: 'stuff'
  };

  try {
    let result = yield this.models.user.createWithCredential.call(this, user, credential);
    this.status = 200;
    this.body = result;
  } catch (err) {
    this.status = 400;
    this.body = err;
  }
};
