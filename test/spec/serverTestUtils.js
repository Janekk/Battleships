var utils = {
  getServer: function (http) {
    return require('../../game/socket-server')(http);
  },

  getClient: function () {
    return require('socket.io-client')('http://localhost:3000', {
      forceNew: true
    });
  }
};

module.exports = utils;