var Reflux = require('Reflux')
  , Actions = require('../actions')
  , _ = require('lodash')
  , BoardUtils = require('../Board/BoardUtils');

var ClipboardStore = Reflux.createStore({
  init: function () {
    this.clipboard = null;
    this.utils = new BoardUtils();
    this.listenTo(Actions.init.setConfig, this.setConfig);
    this.listenTo(Actions.setup.selectConfigItem, this.selectConfigItem);
    this.listenTo(Actions.setup.selectCell, this.tryDrop);
    this.listenTo(Actions.setup.selectShip, this.selectShip);
    this.listenTo(Actions.setup.pivotShip, this.tryPivot);
  },

  setConfig: function(config) {
    this.utils.boardSize = config.boardSize;
  },

  tryPivot: function () {
    var ship = this.clipboard.item;

    if (ship.cells.length > 1) {

      var isHorizontal = ship.cells[0].y == ship.cells[1].y;

      var topLeft = this.utils.getTopLeftShipCell(ship.cells);
      var pivoted = [topLeft];
      _.times(ship.cells.length - 1, function (i) {
        var cell;
        if (isHorizontal) {
          cell = {x: topLeft.x, y: topLeft.y + i + 1};
        }
        else {
          cell = {x: topLeft.x + i + 1, y: topLeft.y};
        }

        if(this.utils.isCellValid(cell)) {
          pivoted.push(cell);
        }
        else {
          pivoted = null;
          return;
        }
      }.bind(this));

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
        var cells = this.utils.getDropCellsForConfigItem(cell, clipboard.item);

        if (this.utils.canBeDropped(cells, null, ships)) {
          this.clipboard = {
            action: 'drop',
            type: clipboard.type,
            item: cells
          };
          this.trigger(this.clipboard);
        }
      }
      else if (clipboard.type == 'board') {
        var cells = this.utils.getDroppedCellsForShip(cell, clipboard.item);
        if (this.utils.canBeDropped(cells, clipboard.item.id, ships)) {
          this.clipboard = {
            action: 'drop',
            type: clipboard.type,
            item: {ship: {id: clipboard.item.id, cells: cells}, old: clipboard.item}
          };
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
});

module.exports = ClipboardStore;