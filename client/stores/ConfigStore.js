var Reflux = require('reflux')
  , socket = require('../socket')
  , gameEvents = require('../../game/gameEvents');

var ConfigStore = Reflux.createStore({
  init() {

    this.state = null;

    socket.on(gameEvents.server.gameStarted, (result) => {
      if (result.isSuccessful) {
        this.state = result.config;
        this.trigger(this.state);
      }
    });
  },

  getState() {
    return this.state;
  }

});

module.exports = ConfigStore;
