var Reflux = require('Reflux')
  , _ = require('lodash')
  , phase = require('../GameStates')
  , Actions = require('../actions')
  , GameplayStore = require('./GameplayStore')
  , gameEvents = require('../../game/gameEvents');

var UserStore = Reflux.createStore({
  init() {

    this.socket = io();

    this.state = {
      signedIn: false,
      isPlaying: false,
      userId: null,
      opponentId: null
    };

    this.listenTo(GameplayStore, this.setState);
  },

  setState(game) {
    this.state.signedIn = game.phase >= phase.inLobby;
    this.state.isPlaying  = (game.phase > phase.inLobby);
    this.state.opponentId  = (game.phase > phase.inLobby) ? game.opponent.id : null;
    this.state.userId  = (game.phase >= phase.inLobby) ? game.user.id : null;

    this.trigger(this.state);
  }
});

module.exports = UserStore;
