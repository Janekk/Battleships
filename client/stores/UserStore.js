var Reflux = require('reflux')
  , socket = require('../socket')
  , _ = require('lodash')
  , phase = require('../gamePhase')
  , Actions = require('../actions')
  , GamePhaseStore = require('./GamePhaseStore')
  , gameEvents = require('../../game/gameEvents');

var UserStore = Reflux.createStore({
  init() {

    this.state = {
      signedIn: false,
      isPlaying: false,
      userId: null,
      opponentId: null
    };

    this.listenTo(GamePhaseStore, this.setState);
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
