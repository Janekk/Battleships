function GameService(socket) {
    var io = socket.server;
    var _ = require('lodash');
    var messageHelper = require('../helper/message');
    var Ship = require('./ship');
    var Position = require('./position');

    this.socket = socket;
    this.opponentGameService = undefined;
    this.isReady = false;               // if TRUE booth players are connected
    this.ships = [];                    // contains the ships for the player
    this.intactShipsCount = undefined;  // number of intact ships; on "0" current player lose
    this.isPlaying = false;             // if TRUE the player can shoot
    this.shoots = [];                   // contains positions to which the player has shot

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

        thisGameService.socket.emit(name, messageHelper.toResult(data));
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

        skipSender = skipSender || false;

        if (!skipSender) {
            thisGameService.sendToMe(name, messageHelper.toResult(data));
        }

        thisGameService.sendToOpponent(name, messageHelper.toResult(data));
    };

    this.connectWithOpponent = function(opponentSocket) {
        if (!opponentSocket) {
            return;
        }

        if (!opponentSocket.gameService) { // no GameService available
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
            _.forEach(shipData.cells, function(ship) {
                positions.push(new Position(ship.x, ship.y));
            });

            thisGameService.ships.push(new Ship(shipData.id, positions));
        });
        thisGameService.intactShipsCount = shipsData.length;

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

        var result = thisGameService.opponentGameService.checkForHit(position);
        thisGameService.sendToRoom('has shot', result);

        var iLost = (thisGameService.intactShipsCount <= 0);
        var opponentLost = (thisGameService.opponentGameService.intactShipsCount <= 0);
        if (iLost || opponentLost) { // all ships are damaged
            // game over
            setTimeout(function() {
                thisGameService.sendToMe('game over', { hasWon: !iLost });
                thisGameService.sendToOpponent('game over', { hasWon: !opponentLost });
            }, 2500);
        }
        else {
            thisGameService.switchPlayer();
        }
    };

    /**
     * Returns TRUE if the position has already been shot.
     */
    this.hasShotOnThisPosition = function(shootPosition) {
        var result = _.find(thisGameService.shoots, shootPosition);
        return (result !== undefined);
    };

    /**
     * Checks a shoot hit a ship.
     * @param shootPosition
     */
    this.checkForHit = function(shootPosition) {
        for (var s = 0; s < thisGameService.ships.length; s++) {
            var ship = thisGameService.ships[s];
            if (ship.healthCount > 0) { // ship is intact
                for (var p = 0; p < ship.positions.length; p++) {
                    var shipPosition = ship.positions[p];
                    if (shipPosition.isDamaged) {
                        continue;
                    }

                    if ((shipPosition.x === shootPosition.x) && (shipPosition.y === shootPosition.y)) { // hit ship
                        shipPosition.isDamaged = true;
                        ship.healthCount--;

                        var shipWasDestroyed = false;

                        if (ship.healthCount <= 0) { // ship was destroyed
                            shipWasDestroyed = true;
                            thisGameService.intactShipsCount--;
                        }

                        return {
                            shipWasHit: true,
                            shipWasDestroyed: shipWasDestroyed,
                            ship: ship,
                            position: { x: shipPosition.x, y: shipPosition.y }
                        };
                    }
                }
            }
        }

        // no hit on a ship
        return {
            shipWasHit: false,
            shipWasDestroyed: false,
            position: { x: shootPosition.x, y: shootPosition.y }
        };
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
    };

    function getRandomNumber(min, max) {
        return Math.floor((Math.random() * max) + min);
    }
}

module.exports = GameService;