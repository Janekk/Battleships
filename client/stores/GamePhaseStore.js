var Reflux = require('Reflux')
  , socket = require('../socket')
  , Actions = require('../actions')
  , _ = require('lodash')
  , phase = require('../gamePhase')
  , gameEvents = require('../../game/gameEvents')
  , validator = require('../../game/Validator');

var GamePhaseStore = Reflux.createStore({
  init() {

    this.game = {};

    this.listenTo(Actions.init.showSignIn, this.initSignIn);
    this.listenTo(Actions.init.signIn, this.initStoresOnSignIn);
    this.listenTo(Actions.init.signIn, this.enterLobby);
    this.listenTo(Actions.init.playSingle, this.playSingle);
    this.listenTo(Actions.game.shoot, this.takeShot);
    this.listenTo(Actions.game.quit, this.quitGame);
    this.listenTo(Actions.init.signOut, this.signOut);

    socket.on('disconnect', () => {
      this.game = {phase: phase.signIn};
      this.trigger(this.game);
    });

    socket.on('connect_error', this.updateConnectionStatus);
    socket.on('connect_timeout', this.updateConnectionStatus);

    socket.on(gameEvents.server.gameStarted, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.setup;
        this.game.opponent = result.opponent;
        this.trigger(this.game);
      }
    });

    socket.on(gameEvents.server.shipsPlaced, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.readyToShoot;
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

    socket.on(gameEvents.server.signOutStatus, (result) => {
      if (result.isSuccessful) {
        this.game = {phase: phase.signIn};


        if(socket) {
          socket.io.close();
        }

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


  initStoresOnSignIn() {
    require('./LobbyStore');
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
    this.game = {phase: phase.signIn};
    this.trigger(this.game);
  },

  takeShot(cell) {
    socket.emit(gameEvents.client.shoot, cell);
  },

  initSignIn() {
    this.game = {phase: phase.signIn};
    this.trigger(this.game);
  },

  enterLobby(userName) {
    var validationError = validator.validateUserId(userName);
    if(validationError) {
      return Actions.common.error(validationError);
    }

    socket.connect();

    socket.on(gameEvents.server.enterLobbyStatus, (result) => {
      if(result.isSuccessful) {
        this.game.phase = phase.inLobby;
        this.game.user = result.user;
        this.trigger(this.game);
      }
    });
    socket.emit(gameEvents.client.enterLobby, userName);
  }
});

module.exports = GamePhaseStore;