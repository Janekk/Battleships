var Reflux = require('Reflux')
  , Actions = require('../actions')
  , _ = require('lodash')
  , BoardUtils = require('../Board/BoardUtils');

var SetupStore = Reflux.createStore({
  init: function () {
    this.state = {
      ships: [],
      selected: null,
      config: null
    };

    this.utils = BoardUtils;
    this.listenTo(Actions.init.setConfig, this.setConfig);
    this.listenTo(Actions.setup.placeShips, this.emitShips);
    this.listenTo(Actions.setup.selectConfigItem, this.selectConfigItem);
    this.listenTo(Actions.setup.selectShip, this.selectShip);
    this.listenTo(Actions.setup.selectCell, this.tryDrop);
    this.listenTo(Actions.setup.pivotShip, this.tryPivot);
  },

  getConfig: function () {
    return this.state.config;
  },

  selectConfigItem: function (ship) {
    this.state.selected = {
      type: 'config',
      item: ship
    };
    this.trigger({selected: this.state.selected});
  },

  selectShip: function (ship) {
    var current = this.state.selected ? this.state.selected.item : null;

    this.state.selected = {
      type: 'board',
      item: (current != ship) ? ship : null
    };
    this.trigger({selected: this.state.selected});
  },

  tryPivot: function () {
    var ship = this.state.selected.item;

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

        if (this.utils.isCellValid(cell)) {
          pivoted.push(cell);
        }
        else {
          pivoted = null;
          return;
        }
      }.bind(this));

      if (pivoted && this.utils.canBeDropped(pivoted, ship.id, this.state.ships)) {
        this.state.selected = {
          type: 'board',
          item: {ship: {id: this.state.selected.item.id, cells: pivoted}, old: this.state.selected.item}
        };
        this.dropShip(this.state.selected);
        this.state.selected = null;
        this.trigger({ships: this.state.ships, selected: this.state.selected});
      }
    }

  },

  tryDrop: function (cell) {
    var selected = this.state.selected;
    var ships = this.state.ships;
    if (selected) {
      if (selected.type == 'config') {
        var cells = this.utils.getDropCellsForConfigItem(cell, selected.item);

        if (this.utils.canBeDropped(cells, null, ships)) {
          this.state.selected = {
            type: selected.type,
            item: cells
          };
          this.dropShip(this.state.selected);
          this.state.selected = null;

          var configShip = _.find(this.state.config, function (item) {
            return (item.size == selected.item.size);
          });
          configShip.count--;
        }
        this.trigger(this.state);
      }
      else if (selected.type == 'board') {
        var cells = this.utils.getDroppedCellsForShip(cell, selected.item);
        if (this.utils.canBeDropped(cells, selected.item.id, ships)) {
          this.state.selected = {
            type: selected.type,
            item: {ship: {id: selected.item.id, cells: cells}, old: selected.item}
          };
          this.dropShip(this.state.selected);
          this.state.selected = null;
          this.trigger({ships: this.state.ships, selected: this.state.selected});
        }
      }
    }
  },

  setConfig: function (config) {
    this.utils.boardSize = config.boardSize;
    this.state.config = config.configShips;
  },

  emitShips: function () {
    var allPlaced = function() {
      return (!_.any(this.state.config, function (item) {
        return (item.count > 0);
      }))
    }.bind(this);

    if(allPlaced()) {
      var socket = io();
      var toSend = this.state.ships.map(function (ship) {
        return ship;
      });
      socket.emit('place ships', toSend);
    }
  },

  dropShip: function (selected) {
    var dropped;
    if (selected.type == 'config') {
      dropped = getNamedShip({cells: selected.item});
      this.state.ships.push(dropped);
    }
    else {
      var index = this.state.ships.indexOf(selected.item.old);
      this.state.ships.splice(index, 1);
      dropped = getNamedShip(selected.item.ship);
      this.state.ships.push(dropped);
    }
  }
});

function getNamedShip(ship) {
  return {id: ship.id ? ship.id : _.uniqueId(), cells: ship.cells};
}

module.exports = SetupStore;