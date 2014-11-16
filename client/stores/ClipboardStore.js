var Reflux = require('Reflux');
var Actions = require('../actions');
var _ = require('lodash');
var gameParams = require('../helpers/gameParams');

var ClipboardStore = Reflux.createStore({
  init: function () {
    this.clipboard = null;
    this.listenTo(Actions.setup.selectConfigItem, this.selectConfigItem);
    this.listenTo(Actions.setup.selectCell, this.tryDrop);
    this.listenTo(Actions.setup.selectShip, this.selectShip);
    this.listenTo(Actions.setup.pivotShip, this.tryPivot);
  },

  tryPivot: function () {
    var ship = this.clipboard.item;

    if (ship.cells.length > 1) {

      var isHorizontal = ship.cells[0].y == ship.cells[1].y;

      var topLeft = getTopLeftShipCell(ship.cells);
      var pivoted = [topLeft];
      _.times(ship.cells.length - 1, function (i) {
        var cell;
        if (isHorizontal) {
          cell = {x: topLeft.x, y: topLeft.y + i + 1};
        }
        else {
          cell = {x: topLeft.x + i + 1, y: topLeft.y};
        }

        if(isCellValid(cell)) {
          pivoted.push(cell);
        }
        else {
          pivoted = null;
          return;
        }
      });

      //TODO: JK: check can be dropped on pivot!
      //canBeDropped(pivoted, this.clipboard.id, )

      if(pivoted) {
        this.clipboard = {
          action: 'drop',
          type: 'board',
          item: {ship: {id: this.clipboard.item.id, cells: pivoted}, old: this.clipboard.item}
        };
        this.trigger(this.clipboard);
      }
    }
  },

  tryDrop: function (cell, ships) {
    this.drop(cell, ships, this.clipboard);
  },

  selectConfigItem: function (ship) {
    this.clipboard = {
      action: 'select',
      type: 'config',
      item: ship
    };
    this.trigger(this.clipboard);
  },

  drop: function (cell, ships, clipboard) {
    if (clipboard && clipboard.action == 'select') {
      if (clipboard.type == 'config') {
        var cells = getDropCellsForConfigItem(cell, clipboard.item);

        if (canBeDropped(cells, null, ships)) {
          this.clipboard = {
            action: 'drop',
            type: clipboard.type,
            item: cells
          };
          this.trigger(this.clipboard);
        }
      }
      else if (clipboard.type == 'board') {
        var cells = getDroppedCellsForShip(cell, clipboard.item);
        if (canBeDropped(cells, clipboard.item.id, ships)) {
          this.clipboard = {
            action: 'drop',
            type: clipboard.type,
            item: {ship: {id: clipboard.item.id, cells: cells}, old: clipboard.item}
          }
          this.trigger(this.clipboard);
        }
      }
    }
  },

  getSelected: function () {
    return this.clipboard;
  },

  selectShip: function (ship) {
    var current = this.clipboard ? this.clipboard.item : null;

    this.clipboard = {
      action: 'select',
      type: 'board',
      item: (current != ship) ? ship : null
    };
    this.trigger(this.clipboard);
  }
})

function getDropCellsForConfigItem(cell, ship) {
  var result = [];
  for (var i = 0; i < ship.size; i++) {
    result.push({x: cell.x + i, y: cell.y});
  }
  return result;
};

function getDroppedCellsForShip(cell, ship) {
  var topLeft = getTopLeftShipCell(ship.cells);
  var deltaX = cell.x - topLeft.x;
  var deltaY = cell.y - topLeft.y;

  var cells = ship.cells.map(function (cell) {
    return {
      x: cell.x + deltaX,
      y: cell.y + deltaY
    }
  });

  return cells;
};

function getTopLeftShipCell(shipCells) {
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
}

function canBeDropped(dropCells, droppedShipId, ships) {

  if(!areCellsValid(dropCells)) {
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
  };
  return true;
}

function isCellValid(cell) {
  return (cell.x < gameParams.tableSize && cell.y < gameParams.tableSize);
}

function areCellsValid(cells) {
  for(var i = 0; i<cells.length; i++) {
    if(!isCellValid(cells[i])) {
      return false;
    }
  }
  return true;
}

module.exports = ClipboardStore;