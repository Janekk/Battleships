var Reflux = require('Reflux')
  , socket = require('../socket')
  , Actions = require('../actions')
  , _ = require('lodash')
  , phase = require('../gamePhase')
  , gameEvents = require('../../game/gameEvents')
  , FacebookStore = require('./FacebookStore');

var GamePhaseStore = Reflux.createStore({
  init() {

    this.game = {
    };

    this.listenTo(FacebookStore, this.updateFbStatus);
    this.listenTo(Actions.init.signInToFb, this.initSignIn);
    this.listenTo(Actions.init.playSingle, this.playSingle);
    this.listenTo(Actions.game.shoot, this.takeShot);
    this.listenTo(Actions.game.quit, this.quitGame);
    this.listenTo(Actions.init.signOut, this.signOut);

    socket.on('disconnect', () => {
      this.game = {phase: phase.signedOutOfGame};
      this.trigger(this.game);
    });

    socket.on('connect_error', this.updateConnectionStatus);
    socket.on('connect_timeout', this.updateConnectionStatus);

    socket.on(gameEvents.server.enterLobbyStatus, (result) => {
      if(result.isSuccessful) {
        this.game.phase = phase.inLobby;
        this.trigger(this.game);
      }
    });

    socket.on(gameEvents.server.gameStarted, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.setup;
        this.trigger(this.game);
      }
    });

    socket.on(gameEvents.server.shipsPlaced, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.shipsPlaced;
        this.trigger(this.game);
      }
    });

    socket.on(gameEvents.server.activatePlayer, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.gameMyTurn;
        this.game.shotUpdate = undefined;
        this.trigger(this.game);
      }
    });

    socket.on(gameEvents.server.gameOver, (result) => {
      this.game.phase = phase.gameOver;
      this.game.hasWon = result.hasWon;
      this.trigger(this.game);
    });

    socket.on(gameEvents.server.playerSwitched, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.gameOpponentsTurn;
        this.game.shotUpdate = undefined;
        this.trigger(this.game);
      }
    });

    socket.on(gameEvents.server.playerLeft, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.inLobby;
        this.trigger(this.game);
      }
    });

    socket.on(gameEvents.server.quitGameStatus, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.inLobby;
        this.trigger(this.game);
      }
    });
  },

  updateFbStatus(fbState) {
    if(!fbState.user) {
      this.game = {phase: phase.signedOutOfFb};
      this.trigger(this.game);
    }
  },

  initStores() {
    require('./ConfigStore');
  },

  playSingle() {
    socket.emit(gameEvents.client.playSingle);
  },

  quitGame() {
    socket.emit(gameEvents.client.quitGame);
  },

  signOut() {
    socket.emit(gameEvents.client.signOut);
  },

  updateConnectionStatus() {
    if(this.game.phase != phase.signedOutOfFb) {
      this.game = {phase: phase.signedOutOfGame};
      this.trigger(this.game);
    }
  },

  takeShot(cell) {
    socket.emit(gameEvents.client.shoot, cell);
  },

  initSignIn() {
    //var social = require('../social');
    //social.signIn({
    //  success: function (me) {
    //    Actions.init.signInToGame(me.id, me.first_name);
    //  },
    //  error: function () {
    //    this.game = {phase: phase.signedOutOfFb};
    //    this.trigger(this.game);
    //  }
    //});
    this.game = {phase: phase.checkingFbStatus};
    this.trigger(this.game);
  }
});

module.exports = GamePhaseStore;