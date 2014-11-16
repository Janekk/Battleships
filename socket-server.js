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

        socket.on('shoot', function(position) {
            socket.gameService.shoot(position);
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

    function getRandomNumber(min, max) {
        return Math.floor((Math.random() * max) + min);
    }

    function GameService(socket) {
        this.socket = socket;
        this.opponentGameService = undefined;
        this.roomID = undefined;
        this.isReady = false;   // if TRUE booth players are connected
        this.ships = [];        // contains the ships for the player
        this.isPlaying = false; // if TRUE the player can shoot
        this.shoots = [];       // contains positions to which the player has shot

        var thisGameService = this;

        this.getRandomGameService = function() {
            if (!thisGameService.opponentGameService) { // no opponent
                return;
            }

            // throw dice
            var diceNumber = getRandomNumber(1, 6);

            return (diceNumber < 4)
                ? thisGameService
                : thisGameService.opponentGameService;
        };

        /**
         * Send a message via socket.io to the current player.
         * @param {string} name - message name
         * @param {string|error|object} [data] - optional, data who send to the current player.
         */
        this.sendToMe = function(name, data) {
            if (!name) {
                throw new Error('"name" is undefined');
            }

            thisGameService.socket.emit(name, transformData(data));
        };

        /**
         * Send a message via socket.io to the opponent.
         * @param {string} name - message name
         * @param {string|error|object} [data] - optional, data who send to the current player.
         */
        this.sendToOpponent = function(name, data) {
            if (!name) {
                throw new Error('"name" is undefined');
            }

            if (!thisGameService.opponentGameService) { // no opponent
                return;
            }

            thisGameService.opponentGameService.socket.emit(name, transformData(data));
        };

        /**
         * Send a message via socket.io to current room.
         * @param {string} name - message name
         * @param {string|error|object} [data] - optional, data who send to the current player.
         * @param {boolean} [skipSender=false] - On TRUE the message will send to all people in the room, except the sender.
         */
        this.sendToRoom = function(name, data, skipSender) {
            if (!name) {
                throw new Error('"name" is undefined');
            }

            if (!thisGameService.roomID) { // no room joined
                throw new Error('you are not in a room!');
            }

            skipSender = skipSender || false;

            if (skipSender) { // send to room (without sender)
                socket.broadcast.to(thisGameService.roomID).emit(name, transformData(data));
            }
            else { // send to room (including sender)
                io.sockets.in(thisGameService.roomID).emit(name, transformData(data));
            }
        };

        /**
         * Transform data to an result object with "isSuccessful" field.
         * @param {string|error|object} [data] - optional, if data is an error "isSuccessful" will set to FALSE otherwise "isSuccessful" is TRUE
         */
        function transformData(data) {
            var result;

            if (_.isUndefined(data)) { // no data
                result = { isSuccessful: true };
            }
            else if (_.isString(data)) { // string
                result = {
                    isSuccessful: true,
                    message: data
                };
            }
            else if (data instanceof Error) { // error
                result = {
                    isSuccessful: false,
                    error: data.message
                };
            }
            else if (_.isObject(data)) { // object
                result = _.merge({ isSuccessful: true }, data);
            }
            else { // unsupported type
                throw new Error('type not supported', data);
            }

            return result;
        }

        this.joinRoom = function(roomID) {
            if (!roomID) { // no roomID
                return;
            }

            if (thisGameService.roomID) { // already in a room
                this.sendToMe('room joined', new Error('You are already in a room'));
                return;
            }

            var roomSockets = getSocketsOfRoom(roomID);
            if (roomSockets.length >= 2) {
                thisGameService.sendToMe('room joined', new Error('There are too many users in this room!'));
                return;
            }

            thisGameService.roomID = roomID;
            thisGameService.socket.join(roomID);

            if (roomSockets.length == 0) { // no opponent
                thisGameService.sendToMe('room joined', 'waiting for player...');
            }
            else { // has opponent
                var opponentSocket = _.find(roomSockets, function(s) {
                    return s.id !== thisGameService.socket.id;
                });

                thisGameService.connectWithOpponent(opponentSocket);
                thisGameService.sendToMe('room joined');
                thisGameService.sendToOpponent('info-message', 'player joined');

                setTimeout(function() {
                    thisGameService.isReady = true;
                    thisGameService.opponentGameService.isReady = true;
                    thisGameService.sendToRoom('game started');
                }, 2500);
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
            thisGameService.isReady = false;
        };

        this.placeShips = function(shipsData) {
            if(!thisGameService.opponentGameService) { // no opponent
                thisGameService.sendToMe('ships placed', new Error('you need a player!'));
                return;
            }

            if (!thisGameService.isReady) { // no ready
                thisGameService.sendToMe('ships placed', new Error('game isn\'t ready'));
                return;
            }

            if (thisGameService.ships.length > 0) { // has ships
                thisGameService.sendToMe('ships placed', new Error('you\'ve already placed your ships!'));
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

            if (thisGameService.opponentGameService.ships.length > 0) { // opponent has placed his ships
                thisGameService.sendToMe('ships placed', 'ships are placed');

                setTimeout(function() {
                    var randomGameService = thisGameService.getRandomGameService();

                    randomGameService.isPlaying = true;
                    randomGameService.sendToMe('activate player', 'you begin');
                    randomGameService.sendToOpponent('info-message', 'player begins');
                }, 2500);
            }
            else { // opponent isn't ready
                thisGameService.sendToMe('ships placed', 'ships are placed<br/>Waiting for player...');
            }

            thisGameService.sendToOpponent('info-message', 'player has placed his ships');
        };

        this.shoot = function(position) {
            if (!position) {
                return;
            }

            if (!thisGameService.isReady) {
                thisGameService.sendToMe('has shot', new Error('Game isn\'t ready yet!'));
                return;
            }

            if (thisGameService.ships.length == 0) { // no ships
                thisGameService.sendToMe('has shot', new Error('Place ships first!'));
                return;
            }

            if (!thisGameService.isPlaying) {
                thisGameService.sendToMe('has shot', new Error('Is not you turn!'));
                return;
            }

            if (thisGameService.hasShotOnThisPosition(position)) {
                thisGameService.sendToMe('has shot', new Error('You can\'t shoot this position!'));
                return;
            }

            // save position
            thisGameService.shoots.push(position);

            var result = thisGameService.checkForHit(position);
            thisGameService.sendToRoom('has shot', result);

            thisGameService.switchPlayer();
        };

        /**
         * Return TRUE if the position has already been shot.
         */
        this.hasShotOnThisPosition = function(position) {
            var result = _.find(thisGameService.shoots, position);
            return (result !== undefined);
        };

        this.checkForHit = function(position) {

        };

        this.switchPlayer = function() {
            if (!thisGameService.isPlaying) { //player is currently not playing
                return;
            }

            thisGameService.isPlaying = false;
            thisGameService.opponentGameService.isPlaying = true;

            thisGameService.sendToMe('player switched');
            thisGameService.sendToOpponent('activate player', 'It\'s your turn!');
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