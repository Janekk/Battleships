var _ = require('lodash');

var BoardUtils = {

  boardSize: 0,

  orderShipCells: function(shipCells) {
    shipCells.sort(function (a, b) {
      if (a.y > b.y) return 1;
      if (a.y < b.y) return -1;
      if (a.y == b.y) {
        if (a.x > b.x) return 1;
        if (a.x < b.x) return -1;
        if (a.x == b.x) return 0;
      }
    });
  },

  getTopLeftShipCell: function(shipCells) {
    this.orderShipCells(shipCells);
    return shipCells[0];
  },

  getBottomRightShipCell: function(shipCells) {
    this.orderShipCells(shipCells);
    return shipCells[shipCells.length - 1];
  },

  getAdjacentCells: function(shipCells) {
    var topLeft = this.getTopLeftShipCell(shipCells);
    var BottomRight = this.getBottomRightShipCell(shipCells);

    var xMin = Math.max(0, topLeft.x - 1);
    var yMin = Math.max(0, topLeft.y - 1);
    var xMax = Math.min(10, BottomRight.x + 1);
    var yMax = Math.min(10, BottomRight.y + 1);

    var adjacentCells = [];
    for(var x = xMin; x <= xMax; x++) {
      for(var y = yMin; y <= yMax; y++) {
        var shipCell = (x >= topLeft.x && x <= BottomRight.x && y >= topLeft.y && y <= BottomRight.y);
        if(!shipCell) {
          adjacentCells.push({x: x, y: y});
        }
      }
    }
    return adjacentCells;
  },

  canBeDropped: function(dropCells, droppedShipId, ships) {
    if(!this.areCellsValid(dropCells)) {
      return false;
    }
    var dropArea = dropCells.concat(this.getAdjacentCells(dropCells));

    for (var i = 0; i < dropArea.length; i++) {
      var cell = dropArea[i];
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
  },

  isCellValid: function(cell) {
    return (cell.x < this.boardSize && cell.y < this.boardSize);
  },

  areCellsValid: function(cells) {
    for(var i = 0; i<cells.length; i++) {
      if(!this.isCellValid(cells[i])) {
        return false;
      }
    }
    return true;
  },

  getDropCellsForConfigItem: function(cell, ship) {
    var result = [];
    for (var i = 0; i < ship.size; i++) {
      result.push({x: cell.x + i, y: cell.y});
    }
    return result;
  },

  getDroppedCellsForShip: function(cell, ship) {
    var topLeft = this.getTopLeftShipCell(ship.cells);
    var deltaX = cell.x - topLeft.x;
    var deltaY = cell.y - topLeft.y;

    return ship.cells.map(function (cell) {
      return {
        x: cell.x + deltaX,
        y: cell.y + deltaY
      }
    });
  }
}

module.exports = BoardUtils;
