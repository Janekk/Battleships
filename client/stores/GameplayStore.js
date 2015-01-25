var Reflux = require('Reflux')
  , Actions = require('../actions')
  , _ = require('lodash')
  , phase = require('../GameStates')
  , gameEvents = require('../../game/gameEvents');

var GameplayStore = Reflux.createStore({
  init() {

    this.socket = io();
    this.game = {};

    this.listenTo(Actions.init.showSignIn, this.initSignIn);
    this.listenTo(Actions.init.signIn, this.initStoresOnSignIn);
    this.listenTo(Actions.init.signIn, this.enterLobby);
    this.listenTo(Actions.game.shoot, this.takeShot);
    this.listenTo(Actions.game.quit, this.quitGame);
    this.listenTo(Actions.init.signOut, this.signOut);

    this.socket.on('disconnect', () => {
      this.game = {phase: phase.signIn};
      this.trigger(this.game);
    });

    this.socket.on('connect_error', this.updateConnectionStatus);
    this.socket.on('connect_timeout', this.updateConnectionStatus);

    this.socket.on(gameEvents.server.gameStarted, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.setup;
        this.game.opponent = result.opponent;
        this.trigger(this.game);
      }
    });

    this.socket.on(gameEvents.server.shipsPlaced, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.readyToShoot;
        this.trigger(this.game);
      }
    });

    this.socket.on(gameEvents.server.activatePlayer, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.gameMyTurn;
        this.game.shotUpdate = undefined;
        this.trigger(this.game);
      }
    });

    this.socket.on(gameEvents.server.gameOver, (result) => {
      this.game.phase = phase.gameOver;
      this.game.hasWon = result.hasWon;
      this.trigger(this.game);
    });

    this.socket.on(gameEvents.server.playerSwitched, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.gameOpponentsTurn;
        this.game.shotUpdate = undefined;
        this.trigger(this.game);
      }
    });

    this.socket.on(gameEvents.server.playerLeft, (result) => {
      if (result.isSuccessful) {
        this.game.phase = phase.inLobby;
        this.trigger(this.game);
      }
    });

    this.socket.on(gameEvents.server.signOutStatus, (result) => {
      if (result.isSuccessful) {
        this.game = {phase: phase.signIn};
        this.trigger(this.game);
      }
    });

    this.socket.on(gameEvents.server.quitGameStatus, (result) => {
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

  quitGame() {
    this.socket.emit(gameEvents.client.quitGame);
  },

  signOut() {
    this.socket.emit(gameEvents.client.signOut);
  },

  updateConnectionStatus() {
    this.game = {phase: phase.signIn};
    this.trigger(this.game);
  },

  takeShot(cell) {
    this.socket.emit(gameEvents.client.shoot, cell);
  },

  initSignIn() {
    this.game = {phase: phase.signIn};
    this.trigger(this.game);
  },

  enterLobby(userName) {

    if(!(/^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF0-9]{3,16}$/).test(userName)) {
      return Actions.common.error('UserID has to be between 4 and 16 characters long and cannot start with a number!');
    }

    this.socket.on(gameEvents.server.enterLobbyStatus, (result) => {
      if(result.isSuccessful) {
        this.game.phase = phase.inLobby;
        this.game.user = result.user;
        this.trigger(this.game);
      }
    });
    this.socket.emit(gameEvents.client.enterLobby, userName);
  }
});

module.exports = GameplayStore;