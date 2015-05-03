var messageHelper = require('./../messageHelper')
  , _ = require('lodash')
  , gameEvents = require('./../gameEvents')
  , Game = require('./game')
  , EventEmitter = require('events').EventEmitter;

function BattleshipsService(emitter, sockets) {
  if (sockets.length > 2) {
    throw new Error('Too many socket joined the game!');
  }

  if (sockets.length <= 0) {
    throw new Error('At least one socket must join the game!');
  }

  var singleMode = (sockets.length == 1);

  var clientEvents = [
    gameEvents.client.placeShips,
    gameEvents.client.shoot
  ];

  sockets.forEach(function (socket) {
    emitter.on(socket.username, function (event, data) {
      if(event != gameEvents.server.gameOver) {
        socket.emit(event, data);
      }
    });

    clientEvents.forEach(function (event) {
      socket.on(event, function (data) {
        emitter.emit(event, socket.username, data);
      });
    });
  });

  var game;
  if(singleMode) {
    var opponentName = 'Computer';
    var opponent = new (require('../../game/battleships/Opponent'))();
    opponent.bindEvents(opponentName, emitter);
    game = new Game(emitter, sockets[0].username, opponentName);
  }
  else {
    game = new Game(emitter, sockets[0].username, sockets[1].username);
  }

  this.start = function () {
    game.start();
  }

  this.end = function () {
    sockets.forEach(function (socket) {
      emitter.removeAllListeners();

      clientEvents.forEach(function (event) {
        socket.removeAllListeners(event);
      });
    });

    this.getSockets = function () {
      return sockets.slice();
    }
  }
}

module.exports = BattleshipsService;