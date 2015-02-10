var _ = require('lodash');
var boardUtils = require('../BoardUtils');
var gameEvents = require('./../gameEvents');

var Opponent = function (userId, emitter) {

  var board, gameConfig, remainingShips;

  var init = function (config) {
    boardUtils.boardSize = config.boardSize;
    gameConfig = config;

    board = {
      inactive: [],
      hitCells: [],
      smallestShipLeft: 1
    };

    remainingShips = _.cloneDeep(config.ships);
  };

  var bindEvents = function (userId, emitter) {
    emitter.on(userId, function (event, result) {
      if (result.isSuccessful) {
        switch (event) {
          case gameEvents.server.gameStarted:
            var placement = placeShips(result.config);
            setTimeout(function () {
              emitter.emit(gameEvents.client.placeShips, userId, placement);
            }, 2000);
            break;
          case gameEvents.server.activatePlayer:
            var shot = shoot(board);
            setTimeout(function () {
              emitter.emit(gameEvents.client.shoot, userId, shot);
            }, 3500);
            break;
          case gameEvents.server.shotUpdate:
            if (result.me) {
              board = updateGameState(board, result);
            }
            break;
        }
      }
    });
  };

  var placeShips = function (config) {
    init(config);

    var ships = _.sortBy(config.ships, function (ship) {
      return -config.boardSize;
    });
    var placement = [];
    var taken = {cells: []};

    ships.forEach(function (ship) {
      for (var i = 0; i < ship.count; i++) {
        var newShip = placeShip(ship.size, taken, config.boardSize);
        if (newShip) {
          placement.push({id: ship.count + '' + ship.size, cells: newShip});
        }
      }
    }.bind(this));

    return placement;
  };

  var placeShip = function (size, taken, boardSize) {
    do {
      var randomPos = {x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize)};
      var vertical = Math.round(Math.random());

      var ship = buildShip(randomPos, size, vertical, boardSize, taken);
    }
    while (!ship);

    return ship;
  };

  var buildShip = function (topLeft, size, vertical, boardSize, taken) {

    if (_.any(taken.cells, {x: topLeft.x, y: topLeft.y})) return false;

    if (vertical) {
      if (topLeft.y + size - 1 >= boardSize) return false;
    }
    else {
      if (topLeft.x + size - 1 >= boardSize) return false;
    }

    var result = [topLeft];
    for (var i = 1; i < size; i++) {
      var cell = {
        x: vertical ? topLeft.x : (topLeft.x + i),
        y: vertical ? (topLeft.y + i) : topLeft.y
      };

      if (_.any(taken.cells, cell)) return false;

      result.push(cell);
    }

    taken.cells = taken.cells.concat(result);
    taken.cells = taken.cells.concat(boardUtils.getAdjacentCells(result));

    return result;
  };

  var shoot = function (board) {
    if (!board) {
      throw new Error("boardState is Empty");
    }
    boardUtils.boardSize = gameConfig.boardSize;

    if (board.hitCells && board.hitCells.length > 0) {
      var index = 0;

      do {
        var hit = board.hitCells[index];
        var adjacentCells = boardUtils.getAdjacentCells([hit], true);

        adjacentCells = _.filter(adjacentCells, function (adjacent) {
          return !_.any(board.inactive, function (takenShot) {
            return (takenShot.x == adjacent.x && takenShot.y == adjacent.y);
          })
        });

        var alongPreviousHit = hitAlongAdjacentHit(hit, board.hitCells, adjacentCells);
        if (alongPreviousHit) {
          return alongPreviousHit;
        }

        index += 1;
      } while (adjacentCells.length == 0 || index < board.hitCells.length);

      if (adjacentCells.length > 0) {
        return adjacentCells[0];
      }
    }
    return takeRandomShot(board);
  };

  var hitAlongAdjacentHit = function (hit, otherHits, adjacentCells) {
    if (adjacentCells.length > 0) {
      var left = hit.x > 0 ? {x: hit.x - 1, y: hit.y} : null;
      var right = (hit.x < gameConfig.boardSize - 1) ? {x: hit.x + 1, y: hit.y} : null;
      var top = hit.y > 0 ? {x: hit.x, y: hit.y - 1} : null;
      var bottom = (hit.y < gameConfig.boardSize - 1) ? {x: hit.x, y: hit.y + 1} : null;

      if (left && right && _.any(otherHits, left) && _.any(adjacentCells, right)) {
        return right;
      }
      if (left && right && _.any(otherHits, right) && _.any(adjacentCells, left)) {
        return left;
      }
      if (top && bottom && _.any(otherHits, top) && _.any(adjacentCells, bottom)) {
        return bottom;
      }
      if (top && bottom && _.any(otherHits, bottom) && _.any(adjacentCells, top)) {
        return top;
      }
    }
  };

  var getFreePositions = function (board) {
    var result = [];
    for (var i = 0; i < gameConfig.boardSize; i++) {
      for (var j = 0; j < gameConfig.boardSize; j++) {
        var pos = {x: i, y: j};
        if (!_.any(board.inactive, pos)) {
          result.push(pos);
        }
      }
    }
    return result;
  };

  var takeRandomShot = function (board) {
    var freePositions = getFreePositions(board);
    var filtered = eliminateCertainMisses(freePositions, board);

    var index = Math.floor(Math.random() * filtered.length);
    return filtered[index];
  };

  var eliminateCertainMisses = function (freePositions, board) {
    if (!board.smallestShipLeft) {
      throw new Error('smallestShipLeft: undefined');
    }

    if (board.smallestShipLeft <= 1) {
      return freePositions;
    }

    return _.filter(freePositions, function (cell) {
      var freeInLine = 1;
      //horiz:
      for (var i = cell.x - 1; i >= 0; i--) {
        if (!_.any(board.inactive, {x: i, y: cell.y})) {
          freeInLine += 1;
          if (freeInLine >= board.smallestShipLeft) {
            return true;
          }
        }
        else {
          break;
        }
      }
      for (var i = cell.x + 1; i < gameConfig.boardSize; i++) {
        if (!_.any(board.inactive, {x: i, y: cell.y})) {
          freeInLine += 1;
          if (freeInLine >= board.smallestShipLeft) {
            return true;
          }
        }
        else {
          break;
        }
      }

      //vert:
      freeInLine = 1;
      for (var i = cell.y - 1; i >= 0; i--) {
        if (!_.any(board.inactive, {x: cell.x, y: i})) {
          freeInLine += 1;
          if (freeInLine >= board.smallestShipLeft) {
            return true;
          }
        }
        else {
          break;
        }
      }
      for (var i = cell.y + 1; i < gameConfig.boardSize; i++) {
        if (!_.any(board.inactive, {x: cell.x, y: 1})) {
          freeInLine += 1;
          if (freeInLine >= board.smallestShipLeft) {
            return true;
          }
        }
        else {
          break;
        }
      }
    })
  };

  var updateGameState = function (board, shotUpdate) {
    if (shotUpdate.shipWasDestroyed) {
      board.inactive = board.inactive.concat(shotUpdate.ship.positions);
      board.inactive = board.inactive.concat(boardUtils.getAdjacentCells(shotUpdate.ship.positions));
      board.inactive = _.uniq(board.inactive, function (cell) {
        return cell.x + '' + cell.y
      });

      board.hitCells = _.remove(board.hitCells, function (cell) {
        _.any(shotUpdate.ship.positions, {x: cell.x, y: cell.y})
      });

      var remaining = _.find(remainingShips, {size: shotUpdate.ship.positions.length});
      remaining.count -= 1;

      var smallestLeft = _(remainingShips)
        .sortBy(function (ship) {
          return ship.size;
        })
        .filter(function (ship) {
          return ship.count > 0;
        })
        .first();
      board.smallestShipLeft = smallestLeft ? smallestLeft.size : 0;
    }
    else {
      if (shotUpdate.shipWasHit) {
        board.hitCells.unshift(shotUpdate.position);
      }

      board.inactive.push(shotUpdate.position);
    }

    return board;
  };

  return {
    init: init,
    bindEvents: bindEvents,
    updateGameState: updateGameState,
    placeShips: placeShips,
    shoot: shoot
  };
};

module.exports = Opponent;
