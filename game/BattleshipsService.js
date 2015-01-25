var messageHelper = require('./messageHelper')
  , _ = require('lodash')
  , gameEvents = require('./gameEvents')
  , BattleshipsGame = require('./BattleshipsGame')
  , EventEmitter = require('events').EventEmitter;

function BattleshipsService(emitter, sockets) {
  if (sockets.length != 2) {
    throw new Error('Expected an array containing two sockets!');
  }

  var clientEvents = [
    gameEvents.client.placeShips,
    gameEvents.client.shoot
  ];

  sockets.forEach(function (socket) {
    emitter.on(socket.username, function (event, data) {
      if(event == 'game over') {

      }
      else {
        socket.emit(event, data);
      }
    });

    clientEvents.forEach(function (event) {
      socket.on(event, function (data) {
        emitter.emit(event, socket.username, data);
      });
    });
  });

  var game = new BattleshipsGame(emitter, sockets[0].username, sockets[1].username);

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