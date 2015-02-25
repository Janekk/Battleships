var _ = require('lodash');

module.exports = function() {
  this.user = null;

  this.setUser = function(usr) {
    this.user = usr;
  }

  this.getUser = function() {
    return this.user;
  }

  this.getUserId = function() {
    return this.user.id;
  }
};
