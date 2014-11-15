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
        this.socket = socket;
        this.opponentGameService = undefined;
        this.roomID = undefined;
        this.ships = [];
        this.isReady = false;

        var thisGameService = this;

        this.sendToMe = function(name, data) {
            thisGameService.socket.emit(name, data);
        };

        this.sendToOpponent = function(name, data) {
            if (!thisGameService.opponentGameService) { // no opponent
                return;
            }

            thisGameService.opponentGameService.socket.emit(name, data);
        };

        this.sendToRoom = function(name, data, isSenderIncluded) {
            isSenderIncluded = isSenderIncluded || false;

            if (!thisGameService.roomID) { // no room joined
                console.log('can\'t send to room because socket isn\'t in a room');
                return;
            }

            if (isSenderIncluded) {
                io.sockets.in(thisGameService.roomID).emit(name, data);
            }
            else {
                socket.broadcast.to(thisGameService.roomID).emit(name, data);
            }
        };

        this.joinRoom = function(roomID) {
            var roomSockets = getSocketsOfRoom(roomID);
            if (roomSockets.length >= 2) {
                return thisGameService.socket.emit('room joined', { isSuccessful: false, error: 'There are too many users in this room!' });
            }

            thisGameService.roomID = roomID;
            thisGameService.socket.join(roomID);

            if (roomSockets.length == 0) { // no opponent
                thisGameService.sendToMe('room joined', {
                    isSuccessful: true,
                    message: 'waiting for player...'
                });
            }
            else { // has opponent
                var opponentSocket = _.find(roomSockets, function(s) {
                    return s.id !== thisGameService.socket.id;
                });

                thisGameService.connectWithOpponent(opponentSocket);
                thisGameService.sendToMe('room joined', { isSuccessful: true });
                thisGameService.sendToOpponent('player joined');

                setTimeout(function() {
                    thisGameService.sendToRoom('game started', { isSuccessful: true }, true);
                }, 5000);
            }
        };

        this.connectWithOpponent = function(opponentSocket) {
            if (!opponentSocket) {
                return;
            }

            if (thisGameService.opponentGameService) { // opponent already connected
                return;
            }

            thisGameService.opponentGameService = opponentSocket.gameService;
            thisGameService.opponentGameService.connectWithOpponent(thisGameService.socket)
        };

        this.disconnectOpponent = function() {
            if (!thisGameService.opponentGameService) { // no opponent connected
                return;
            }

            // remove opponent
            thisGameService.opponentGameService = undefined;
        };

        this.placeShips = function(shipsData) {
            if(!thisGameService.opponentGameService) { // no opponent
                thisGameService.sendToMe('ships placed', { isSuccessful: false, error: 'you need a player!' });
                return;
            }

            if (thisGameService.isReady) {
                thisGameService.sendToMe('ships placed', { isSuccessful: false, error: 'you\'ve already placed your ships!' });
                return;
            }

            // transform ships
            _.forEach(shipsData, function(shipData) {
                var positions = [];
                _.forEach(shipData, function(positionData) {
                    positions.push(new Position(positionData.x, positionData.y));
                });

                thisGameService.ships.push(new Ship(positions));
            });

            thisGameService.isReady = true;
            thisGameService.sendToMe('ships placed', { isSuccessful: true });

            if (thisGameService.opponentGameService.isReady) {
                // TODO select player to shoot into the water...
            }
            else { // opponent isn't ready
                thisGameService.sendToOpponent('message', 'player is ready');
            }
        };

        this.disconnect = function() {
            if (thisGameService.opponentGameService) { // has opponent
                thisGameService.sendToOpponent('player left');
                thisGameService.opponentGameService.disconnectOpponent();
                thisGameService.disconnectOpponent();
            }

            if (thisGameService.roomID) {
                // leave room
                thisGameService.socket.leave(thisGameService.roomID);
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