var Reflux = require('Reflux')
  , Actions = require('../actions')
  , _ = require('lodash');

var GameplayStore = Reflux.createStore({
  init() {

    this.socket = io();
    this.game = {
      config: {}
    };

    this.listenTo(Actions.init.setConfig, this.setConfig);
    this.listenTo(Actions.init.startGame, this.initSignIn);
    this.listenTo(Actions.init.signIn, this.initSetup);
    this.listenTo(Actions.game.shoot, this.takeShot);


    this.socket.on('room joined', (result) => {
      if (result.isSuccessful) {
        this.game.phase = 'room-joined';
        this.trigger(this.game);
      }
    });

    this.socket.on('ships placed', (result) => {
      if (result.isSuccessful) {
        this.game.phase = 'ready-to-shoot';
        this.trigger(this.game);
      }
    });

    this.socket.on('activate player', (result) => {
      if (result.isSuccessful) {
        this.game.phase = 'game-my-turn';
        this.game.shot = undefined;
        this.trigger(this.game);
      }
    });

    this.socket.on('game over', (result) => {
      this.game.phase = 'game-over';
      this.game.hasWon = result.hasWon;
      this.trigger(this.game);
    });

    this.socket.on('player switched', (result) => {
      if (result.isSuccessful) {
        this.game.phase = 'game-opponents-turn';
        this.game.shot = undefined;
        this.trigger(this.game);
      }
    });

    this.socket.on('player left', (result) => {
      if (!result.isSuccessful) { // error
        this.game.phase = 'player-left';
        this.trigger(this.game);
      }
    });
  },

  takeShot(cell) {
    this.socket.emit('shoot', cell);
  },

  initSignIn() {
    this.game.phase = 'sign-in';
    this.trigger(this.game);
  },

  setConfig(config) {
    this.game.config.boardSize = config.boardSize;
  },

  initSetup(roomId) {
    this.socket.on('game started', (result) => {
      if (result.isSuccessful) {
        this.game = {
          phase: 'setup',
          roomId: roomId
        };
        this.trigger(this.game);
      }
    });
    this.socket.emit('join room', roomId);
  }
});

module.exports = GameplayStore;