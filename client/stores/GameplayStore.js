var Reflux = require('Reflux')
  , Actions = require('../actions')
  , _ = require('lodash');

var GameplayStore = Reflux.createStore({
  init: function () {

    this.socket = io();
    this.game = {
      config: {}
    };

    this.listenTo(Actions.init.setConfig, this.setConfig);
    this.listenTo(Actions.init.startGame, this.initSignIn);
    this.listenTo(Actions.init.signIn, this.initSetup);
    this.listenTo(Actions.game.shoot, this.takeShot);


    this.socket.on('room joined', function (result) {
      if (result.isSuccessful) {
        this.game.phase = 'room-joined';
        this.trigger(this.game);
      }
    }.bind(this));

    this.socket.on('ships placed', function (result) {
      if (result.isSuccessful) {
        this.game.phase = 'ready-to-shoot';
        this.trigger(this.game);
      }
    }.bind(this));

    this.socket.on('activate player', function (result) {
      if (result.isSuccessful) {
        this.game.phase = 'game-my-turn';
        this.game.shot = undefined;
        this.trigger(this.game);
      }
    }.bind(this));

    //this.socket.on('has shot', function (result) {
    //  if (result.isSuccessful) {
    //    this.game.shot = {position: result.position, hit: result.shipWasHit, destroyed: result.shipWasDestroyed}
    //    this.trigger(this.game);
    //  }
    //}.bind(this));

    this.socket.on('game over', function (result) {
      this.game.phase = 'game-over';
      this.game.hasWon = result.hasWon;
      this.trigger(this.game);
    }.bind(this));


    this.socket.on('player switched', function (result) {
      if (result.isSuccessful) {
        this.game.phase = 'game-opponents-turn';
        this.game.shot = undefined;
        this.trigger(this.game);
      }
    }.bind(this));

    this.socket.on('player left', function (result) {
      if (!result.isSuccessful) { // error
        this.game.phase = 'player-left';
        this.trigger(this.game);
      }
    }.bind(this));
  },

  takeShot: function (cell) {
    this.socket.emit('shoot', cell);
  },

  initSignIn: function () {
    this.game.phase = 'sign-in';
    this.trigger(this.game);
  },

  setConfig: function (config) {
    this.game.config.boardSize = config.boardSize;
  },

  initSetup: function (roomId) {
    this.socket.on('game started', function (result) {
      if (result.isSuccessful) {
        this.game = {
          phase: 'setup',
          roomId: roomId
        };
        this.trigger(this.game);
      }
    }.bind(this));
    this.socket.emit('join room', roomId);
  }
});

module.exports = GameplayStore;