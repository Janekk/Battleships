var _ = require('lodash');

function BoardUtils() {

  this.boardSize = 0;

  this.getTopLeftShipCell = function(shipCells) {
    shipCells.sort(function (a, b) {
      if (a.y > b.y) return 1;
      if (a.y < b.y) return -1;
      if (a.y == b.y) {
        if (a.x > b.x) return 1;
        if (a.x < b.x) return -1;
        if (a.x == b.x) return 0;
      }
    });

    return shipCells[0];
  };

  this.canBeDropped = function(dropCells, droppedShipId, ships) {
    if(!this.areCellsValid(dropCells)) {
      return false;
    }

    for (var i = 0; i < dropCells.length; i++) {
      var cell = dropCells[i];
      if (_.find(ships, function (ship) {
          if (ship.id == droppedShipId) {
            return false;
          }
          var takenCell = _.find(ship.cells, function (shipCell) {
            return (shipCell.x == cell.x && shipCell.y == cell.y);
          });
          return takenCell ? true : false;
        })) {
        return false;
      }
    }
    return true;
  };

  this.isCellValid = function(cell) {
    return (cell.x < this.boardSize && cell.y < this.boardSize);
  };

  this.areCellsValid = function(cells) {
    for(var i = 0; i<cells.length; i++) {
      if(!this.isCellValid(cells[i])) {
        return false;
      }
    }
    return true;
  };

  this.getDropCellsForConfigItem = function(cell, ship) {
    var result = [];
    for (var i = 0; i < ship.size; i++) {
      result.push({x: cell.x + i, y: cell.y});
    }
    return result;
  };

  this.getDroppedCellsForShip = function(cell, ship) {
    var topLeft = this.getTopLeftShipCell(ship.cells);
    var deltaX = cell.x - topLeft.x;
    var deltaY = cell.y - topLeft.y;

    return ship.cells.map(function (cell) {
      return {
        x: cell.x + deltaX,
        y: cell.y + deltaY
      }
    });
  };
}

module.exports = BoardUtils;
