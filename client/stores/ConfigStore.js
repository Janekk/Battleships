var Reflux = require('reflux');
var gameEvents = require('../../game/gameEvents');

var ConfigStore = Reflux.createStore({
  init() {
    this.socket = io();

    this.state = null;

    this.socket.on(gameEvents.server.gameStarted, (result) => {
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
