var messageHelper = require('./../messageHelper')
  , _ = require('lodash')
  , gameEvents = require('./../gameEvents')
  , Game = require('./Game');

function BattleshipsService(emitter, sockets) {
  if (sockets.length > 2) {
    throw new Error('Too many sockets have joined the game!');
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
    emitter.on(socket.getUserId(), function (event, data) {
      if(event != gameEvents.server.gameOver) {
        socket.emit(event, data);
      }
    });

    clientEvents.forEach(function (event) {
      socket.on(event, function (data) {
        emitter.emit(event, socket.getUserId(), data);
      });
    });
  });

  var game;
  if(singleMode) {
    var dummyUser = {id: 'Computer', name: 'Computer'};
    var opponent = new (require('../../game/battleships/Opponent'))();
    opponent.bindEvents(dummyUser.id, emitter);
    game = new Game(emitter, sockets[0].getUser(), dummyUser);
  }
  else {
    game = new Game(emitter, sockets[0].getUser(), sockets[1].getUser());
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