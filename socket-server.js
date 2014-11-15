module.exports = function(http) {
    var io = require('socket.io')(http);
    var _ = require('lodash');

    io.on('connection', function(socket) {
        socket.gameService = new GameService(socket);

        socket.on('join room', function(roomID) {
            socket.gameService.joinRoom(roomID);
        });

        socket.on('place ships', function(shipsData) {
            socket.gameService.placeShips(shipsData);
        });

        socket.on('disconnect', function(){
            socket.gameService.disconnect();
        });
    });

    function getSocketsOfRoom(roomID, namespace) {
        var ns = io.of(namespace || '/');

        if (!roomID || !ns) {
            return [];
        }

        return _.filter(ns.connected, function(socket) {
            return _.contains(socket.rooms, roomID);
        });
    }

    function GameService(socket) {
        var gameServiceContext = this;

        this.currentSocket = socket;
        this.opponentSocket = undefined;

        this.roomID = undefined;
        this.ships = [];
        this.isReady = false;

        this.joinRoom = function(roomID) {
            var roomSockets = getSocketsOfRoom(roomID);
            if (roomSockets.length >= 2) {
                return gameServiceContext.currentSocket.emit('room joined', { isSuccessful: false, error: 'There are too many users in this room!' });
            }

            gameServiceContext.roomID = roomID;
            gameServiceContext.currentSocket.join(roomID);

            if (roomSockets.length == 0) { // no opponent at the moment
                gameServiceContext.currentSocket.emit('room joined', {
                    isSuccessful: true,
                    message: 'waiting for player...'
                });
            }
            else { // has opponent
                var opponentSocket = _.find(roomSockets, function(s) {
                    return s.id !== gameServiceContext.currentSocket.id;
                });

                gameServiceContext.connectSockets(opponentSocket);

                setTimeout(function() {
                    io.sockets.in(gameServiceContext.roomID).emit('game started', {});
                }, 5000);
            }
        };

        this.connectSockets = function(opponentSocket) {
            gameServiceContext.opponentSocket = opponentSocket;
            opponentSocket.gameService.opponentSocket = gameServiceContext.currentSocket;

            gameServiceContext.currentSocket.emit('room joined', { isSuccessful: true });
            gameServiceContext.opponentSocket.emit('player joined');
        };

        this.placeShips = function(shipsData) {
            if(!gameServiceContext.opponentSocket) { // no opponent
                gameServiceContext.currentSocket.emit('ships placed', { isSuccessful: false, error: 'you need a player!' });
                return;
            }

            if (gameServiceContext.isReady) {
                gameServiceContext.currentSocket.emit('ships placed', { isSuccessful: false, error: 'you\'ve already placed your ships!' });
                return;
            }

            _.forEach(shipsData, function(shipData) {
                var positions = [];
                _.forEach(shipData, function(positionData) {
                    positions.push(new Position(positionData.x, positionData.y));
                });

                gameServiceContext.ships.push(new Ship(positions));
            });

            gameServiceContext.isReady = true;

            gameServiceContext.currentSocket.emit('ships placed', { isSuccessful: true });
            gameServiceContext.opponentSocket.emit('message', 'player is ready');
        };

        this.disconnect = function() {
            if (gameServiceContext.opponentSocket) { // has opponent
                // remove from opponent
                gameServiceContext.opponentSocket.gameService.opponentSocket = undefined;
                gameServiceContext.opponentSocket.emit('player left');
            }

            if (gameServiceContext.roomID) {
                // leave room
                gameServiceContext.currentSocket.leave(gameServiceContext.roomID);
            }
        }
    }

    function Ship(positions) {
        this.positions = positions;
    }

    function Position(x, y) {
        this.x = x;
        this.y = y;
    }

    return io;
};