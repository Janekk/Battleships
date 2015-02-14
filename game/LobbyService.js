var _ = require('lodash')
  , messageHelper = require('./messageHelper')
  , gameEvents = require('./gameEvents')
  , Lobby = require('./Lobby')
  , EventEmitter = require('events').EventEmitter;

module.exports = function (io, gameService) {

  var _lobby = new Lobby();
  var _games = [];

  var _findUserSocket = function (userId) {
    if (!userId) return;

    var sockets = io.sockets.sockets;
    return _.find(sockets, {username: userId});
  };

  var _leaveLobby = function (socket, startsPlay) {
    _lobby.leaveLobby(socket.username, startsPlay);
    socket.leave('lobby');
  };

  var _startGame = function (Game) {
    return {
      with: function (emitter, sockets) {
        var game = new Game(emitter, sockets);

        sockets.forEach(function (socket) {
          _games.push({userId: socket.username, game: game});
        });
        game.start();
        return game;
      }
    }
  }

  var _endGameWith = function (userId) {
    var assignment = _.find(_games, {userId: userId});
    if (assignment) {
      var game = assignment.game;
      _.remove(_games, {game: game});

      game.end();
      return game;
    }
  };

  this.start = function () {

    io.on('connection', function (socket) {
      socket.emit("ping");

      socket.on(gameEvents.client.enterLobby, function (username) {
        var result = _lobby.enterLobby(username);
        socket.emit(gameEvents.server.enterLobbyStatus, result);

        if (result.isSuccessful) {
          socket.username = username;
          socket.join('lobby');

          var update = _.merge({newUser: result.user}, _lobby.getLobbyState());
          io.to('lobby').emit(gameEvents.server.lobbyUpdate, update);
        }
      });

      socket.on(gameEvents.client.invitationRequest, function (userID) {
        var result = _lobby.inviteUser(userID, socket.username);
        socket.emit(gameEvents.server.invitationRequestStatus, result);

        if (result.isSuccessful) {
          var otherSocket = _findUserSocket(userID);
          otherSocket.emit(gameEvents.server.invitationForward, result);
        }
      });

      socket.on(gameEvents.client.invitationResponse, function (response) {
        this.onInvitationResponse(socket, response);
      }.bind(this));

      socket.on(gameEvents.client.playSingle, function () {
        this.onPlaySingle(socket);
      }.bind(this));

      socket.on(gameEvents.client.quitGame, function () {
        this.onQuit(socket);
      }.bind(this));

      socket.on(gameEvents.client.signOut, function () {
        this.onSignOut(socket);
      }.bind(this));

      socket.on('disconnect', function () {
        this.onSignOut(socket, true);
      }.bind(this));
    }.bind(this));
  };

  this.onInvitationResponse = function (socket, response) {
    if (socket.username != response.invitation.to) {
      return socket.emit(gameEvents.server.invitationResponse,
        messageHelper.toResult(new Error('User ID mismatch in invitation response')));
    }

    var result = _lobby.acceptInvitation(response.accepted, response.invitation);
    socket.emit(gameEvents.server.invitationResponse, result);

    if (result.isSuccessful) {
      var otherSocket = _findUserSocket(response.invitation.from);
      otherSocket.emit(gameEvents.server.invitationResponse, result);

      //join game
      _leaveLobby(socket, true);
      _leaveLobby(otherSocket, true);
      io.to('lobby').emit(gameEvents.server.lobbyUpdate, _lobby.getLobbyState());

      setTimeout(function () {
        var emitter = new EventEmitter();
        _startGame(gameService).with(emitter, [socket, otherSocket]);
        emitter.on(gameEvents.server.gameOver, this.onGameOver);
      }.bind(this), 1000);
    }
  };

  this.onPlaySingle = function (socket) {
    _leaveLobby(socket, true);

    io.to('lobby').emit(gameEvents.server.lobbyUpdate, _lobby.getLobbyState());
    setTimeout(function () {
      var emitter = new EventEmitter();
      _startGame(gameService).with(emitter, [socket]);
      emitter.on(gameEvents.server.gameOver, this.onGameOver);
    }.bind(this), 1000);
  };

  this.onQuit = function (socket) {
    var game = _endGameWith(socket.username);
    if (game) {
      game.getSockets().forEach(function (gameSocket) {
        if (gameSocket != socket) {
          gameSocket.emit(gameEvents.server.playerLeft, messageHelper.toResult('Player ' + socket.username + ' has left the game!'));
        }

        _lobby.enterLobby(gameSocket.username, true);
        gameSocket.join('lobby');
      });
    }
    socket.emit(gameEvents.server.quitGameStatus, messageHelper.OK());
    io.to('lobby').emit(gameEvents.server.lobbyUpdate, _lobby.getLobbyState());
  }

  this.onSignOut = function (socket, disconnect) {
    _leaveLobby(socket);
    var game = _endGameWith(socket.username);
    if (game) {
      var gameSockets = _.filter(game.getSockets(), function (gSocket) {
        return (gSocket != socket);
      });

      if (gameSockets) {
        gameSockets.forEach(function (gameSocket) {
          gameSocket.emit(gameEvents.server.playerLeft, messageHelper.toResult('Player ' + socket.username + ' has left the game!'));

          _lobby.enterLobby(gameSocket.username, true);
          gameSocket.join('lobby');
        });
      }
    }

    if (!disconnect) {
      socket.emit(gameEvents.server.signOutStatus, messageHelper.OK());
    }

    io.to('lobby').emit(gameEvents.server.lobbyUpdate, _lobby.getLobbyState());
  }

  this.onGameOver = function (items) {

    _endGameWith(items[0].userId);

    items.forEach(function (item) {

      var socket = _findUserSocket(item.userId);
      if(socket) {
        var payload = item.payload;

        socket.emit(gameEvents.server.gameOver, messageHelper.toResult(payload));

        _lobby.enterLobby(socket.username, true);
        socket.join('lobby');
      }
    });
    io.to('lobby').emit(gameEvents.server.lobbyUpdate, _lobby.getLobbyState());
  }
}
;