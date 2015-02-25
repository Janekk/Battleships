var _ = require('lodash')
  , messageHelper = require('./../messageHelper')
  , gameEvents = require('./../gameEvents')
  , Ship = require('./../models/ship')
  , Position = require('./../models/position');

var GameUser = function (user) {
  this.id = user.id;
  this.name = user.name;
  this.ships = [];                    // contains the ships for the player
  this.intactShipsCount = undefined;  // number of intact ships; on "0" current player lose
  this.shoots = [];                   // contains positions to which the player has shot

  this.hasShotOnThisPosition = function (shootPosition) {
    var result = _.find(this.shoots, shootPosition);
    return (result !== undefined);
  };
}

var BattleshipsGame = function (emitter, userA, userB) {

  if (!userA || !userB) {
    throw new Error("One of user IDs is missing");
  }

  this.userA = new GameUser(userA);
  this.userB = new GameUser(userB);

  emitter.on(gameEvents.client.placeShips, function (userId, shipsData) {
    this.placeShips(userId, shipsData);
  }.bind(this));

  emitter.on(gameEvents.client.shoot, function (userId, position) {
    this.shoot(userId, position);
  }.bind(this));

  this._getStartingUser = function () {
    // throw dice
    var diceNumber = getRandomNumber(1, 6);

    return (diceNumber < 4)
      ? this.sender : this.opponent;
  };

  this.getConfig = function() {
    return {
      boardSize: 10,
      ships: [
        {name: 'Battleship', size: 5, count: 1},
        {name: 'Submarine', size: 4, count: 1},
        {name: 'Cruiser', size: 3, count: 2},
        {name: 'Destroyer', size: 2, count: 2},
        {name: 'Patrol boat', size: 1, count: 2}
      ]};
  };

  this.start = function() {
    emitter.emit(this.userA.id, gameEvents.server.gameStarted, messageHelper.toResult({config: this.getConfig(), opponent: this.userB}));
    emitter.emit(this.userB.id, gameEvents.server.gameStarted, messageHelper.toResult({config: this.getConfig(), opponent: this.userA}));
  };

  this.placeShips = function (senderId, ships) {
    this._setUsers(senderId);

    if (this.sender.ships.length > 0) { // has ships
      this._sendToSender(gameEvents.server.shipsPlaced, new Error('you\'ve already placed your ships!'));
      return;
    }

    // transform ships
    ships.forEach(function (ship) {
      var positions = [];
      ship.cells.forEach(function (cell) {
        positions.push(new Position(cell.x, cell.y));
      });

      this.sender.ships.push(new Ship(ship.id, positions));
    }.bind(this));
    this.sender.intactShipsCount = ships.length;

    if (this.opponent.ships.length > 0) { // opponent has placed his ships
      this._sendToSender(gameEvents.server.shipsPlaced, 'ships are placed');

      setTimeout(function () {
        var startingUser = this._getStartingUser();

        startingUser.hasTurn = true;
        this._sendToUser(startingUser.id, gameEvents.server.activatePlayer, 'you begin!');
        this._sendToUser(((startingUser == this.sender) ? this.opponent : this.sender).id,
          gameEvents.server.infoMessage, startingUser.id + ' begins!');
      }.bind(this), 1000);
    }
    else { // opponent isn't ready
      this._sendToSender(gameEvents.server.shipsPlaced, 'ships are placed. Waiting for ' + this.opponent.name + '...');
    }

    this._sendToOpponent(gameEvents.server.infoMessage, this.sender.id + ' has placed his ships!');
  };

  this._sendToUser = function (userId, eventName, data) {
    if (!eventName) {
      throw new Error('"eventName" is undefined');
    }
    if (!userId) {
      throw new Error('"userId" is undefined');
    }

    emitter.emit(userId, eventName, messageHelper.toResult(data));
  };

  this._sendToSender = function (eventName, data) {
    this._sendToUser(this.sender.id, eventName, data);
  };

  this._sendToOpponent = function (eventName, data) {
    this._sendToUser(this.opponent.id, eventName, data);
  };

  this.shoot = function (senderId, position) {
    this._setUsers(senderId);

    if (!position) {
      return;
    }

    if (this.sender.ships.length == 0) { // no ships
      this._sendToSender(gameEvents.server.shotUpdate, new Error('Place ships first!'));
      return;
    }

    if (!this.sender.hasTurn) {
      this._sendToSender(gameEvents.server.shotUpdate, new Error('It\'s not you turn!'));
      return;
    }

    if (this.sender.hasShotOnThisPosition(position)) {
      this._sendToSender(gameEvents.server.shotUpdate, new Error('You can\'t shoot at this position!'));
      return;
    }

    this.sender.shoots.push(position);

    var result = this._checkForHit(this.opponent, position);
    this._sendToSender(gameEvents.server.shotUpdate, _.chain(result).merge({me: true}).omit(!result.shipWasDestroyed ? 'ship': '').value());
    this._sendToOpponent(gameEvents.server.shotUpdate, _.merge(result, {me: false}));

    var iLost = (this.sender.intactShipsCount <= 0);
    var opponentLost = (this.opponent.intactShipsCount <= 0);
    var gameOver = iLost || opponentLost;
    if (gameOver) {
      setTimeout(function () {
        emitter.emit(gameEvents.server.gameOver,[
          {userId: this.sender.id, payload: {hasWon: !iLost}},
          {userId: this.opponent.id, payload: {hasWon: !opponentLost}}
          ]);
      }.bind(this), 1000);
    }
    else {
      this._switchPlayer(this.sender.id);
    }
  };

  /**
   * Checks a shoot hit a ship.
   * @param shootPosition
   */
  this._checkForHit = function (user, shootPosition) {

    for (var s = 0; s < user.ships.length; s++) {
      var ship = user.ships[s];
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
              user.intactShipsCount--;
            }

            return {
              shipWasHit: true,
              shipWasDestroyed: shipWasDestroyed,
              ship: ship,
              position: {x: shipPosition.x, y: shipPosition.y}
            };
          }
        }
      }
    }

    // no hit on a ship
    return {
      shipWasHit: false,
      shipWasDestroyed: false,
      position: {x: shootPosition.x, y: shootPosition.y}
    };
  };

  this._switchPlayer = function (senderId) {
    if (!this.sender.hasTurn) { //player is currently not playing
      return;
    }

    this.sender.hasTurn = false;
    this.opponent.hasTurn = true;

    this._sendToUser(this.sender.id, gameEvents.server.playerSwitched);
    this._sendToUser(this.opponent.id, gameEvents.server.activatePlayer, 'It\'s your turn!');
  };

  this._setUsers = function (eventUserId) {
    if (eventUserId != this.userA.id && eventUserId != this.userB.id) {
      throw new Error('User with ID \'' + eventUserId + '\' is not authorized to play this game');
    }

    this.sender = (eventUserId == this.userA.id) ? this.userA : this.userB;
    this.opponent = (eventUserId == this.userA.id) ? this.userB : this.userA;
  }

  function getRandomNumber(min, max) {
    return Math.floor((Math.random() * max) + min);
  }
};

module.exports = BattleshipsGame;

