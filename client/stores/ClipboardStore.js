var Reflux = require('Reflux');
var Actions = require('../actions');
var _ = require('lodash');

var ClipboardStore = Reflux.createStore({
  init: function () {
    this.clipboard = null;
    this.listenTo(Actions.setup.selectConfigItem, this.selectConfigItem);
    this.listenTo(Actions.setup.selectCell, this.selectCell);
    this.listenTo(Actions.setup.selectShip, this.selectShip);
  },

  selectCell: function (cell, ships) {
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
        if (canBeDropped(cells, ships)) {
          this.clipboard = {
            action: 'drop',
            type: clipboard.type,
            item: cells
          }
          this.trigger(this.clipboard);
        }
      }
      else if(clipboard.type == 'board') {
        var cells = getDroppedCellsForShip(cell, clipboard.item);
        if(canBeDropped(clipboard.item.cells)) {
          this.clipboard = {
            action: 'drop',
            type: clipboard.type,
            item: { cells: cells, old: clipboard.item }
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
  ship.cells.sort(function(a, b){
    if(a.y > b.y) return 1;
    if(a.y < b.y) return -1;
    if(a.y == b.y) {
      if(a.x > b.x) return 1;
      if(a.x < b.x) return -1;
      if(a.x == b.x) return 0;
    }
  });
  var deltaX = cell.x - ship.cells[0].x;
  var deltaY = cell.y - ship.cells[0].y;

  var cells = ship.cells.map(function(cell) {
    return {
      x: cell.x + deltaX,
      y: cell.y + deltaY
    }
  });

  return cells;
};

function canBeDropped(dropCells, ships) {
  dropCells.forEach(function (cell) {
    if (_.find(ships, function (ship) {
        _.find(ship.cells, function (shipCell) {
          return (shipCell.x == cell.x && shipCell.y == cell.y);
        })
      })) {
      return false;
    }
  });
  return true;
}

module.exports = ClipboardStore;