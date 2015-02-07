var Reflux = require('Reflux')
  , socket = require('../socket')
  , Actions = require('../actions')
  , _ = require('lodash')
  , BoardUtils = require('../Board/BoardUtils')
  , gameEvents = require('../../game/gameEvents')
  , ConfigStore = require('./ConfigStore')
  , phase = require('../GameStates')
  , GameplayStore = require('./GameplayStore');

function getNamedShip(ship) {
  return {id: ship.id ? ship.id : _.uniqueId(), cells: ship.cells};
}

var SetupStore = Reflux.createStore({

  reset() {
    this.state = {
      ships: [],
      selected: null,
      config: null,
      allPlaced: false
    };
  },

  getState() {
    return this.state;
  },

  init() {
    this.reset();

    this.utils = BoardUtils;
    this.listenTo(GameplayStore, this.checkGamePhase);
    this.listenTo(ConfigStore, this.setConfig);
    this.listenTo(Actions.setup.placeShips, this.emitShips);
    this.listenTo(Actions.setup.selectConfigItem, this.selectConfigItem);
    this.listenTo(Actions.setup.selectShip, this.selectShip);
    this.listenTo(Actions.setup.selectCell, this.tryDrop);
    this.listenTo(Actions.setup.pivotShip, this.tryPivot);
  },

  checkGamePhase(game) {
    if(game.phase <= phase.inLobby) {
      this.reset();
    }
  },

  setConfig(config) {
    this.utils.boardSize = config.boardSize;
    this.state.config = config;
    this.trigger(this.state);
  },

  selectConfigItem(ship) {
    this.state.selected = {
      type: 'config',
      item: ship
    };
    this.trigger(this.state);
  },

  selectShip(ship) {
    var current = this.state.selected ? this.state.selected.item : null;

    if (current != ship) {
      this.state.selected = {
        type: 'board',
        item: {id: ship.id}
      };
      this.trigger(this.state);
    }
  },

  tryPivot() {
    var {state} = this, {selected} = state;
    var ship = _.find(state.ships, {id: selected.item.id});

    if (ship.cells.length > 1) {

      var isHorizontal = ship.cells[0].y == ship.cells[1].y;

      var topLeft = this.utils.getTopLeftShipCell(ship.cells);
      var pivoted = [topLeft];
      for (var i = 0; i < ship.cells.length - 1; i++) {
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
      }

      if (pivoted && this.utils.canBeDropped(pivoted, ship.id, state.ships)) {
        //state.selected = {
        //  type: 'board',
        //  item: {ship: {id: state.selected.item.id, cells: pivoted}, old: state.selected.item}
        //};
        this.dropShip(pivoted, ship.id);
        state.selected = null;
        this.trigger(state);
      }
    }
  },

  tryDrop(cell) {
    var {state} = this, ships = state.ships;
    var selected = state.selected;
    if (selected) {
      if (selected.type == 'config') {
        var cells = this.utils.getDropCellsForConfigItem(cell, selected.item);

        if (this.utils.canBeDropped(cells, null, ships)) {
          state.selected = {
            type: selected.type,
            item: cells
          };
          this.dropShip(state.selected);
          state.selected = null;

          var configShip = _.find(state.config.ships, (item) => {
            return (item.size == selected.item.size);
          });
          configShip.count--;
        }
      }
      else if (selected.type == 'board') {
        var ship = _.find(state.ships, {id: selected.item.id})
        var cells = this.utils.getDroppedCellsForShip(cell, ship.cells);
        if (this.utils.canBeDropped(cells, selected.item.id, ships)) {
          this.dropShip(cells, ship.id);
          state.selected = null;
        }
      }
      state.allPlaced = (!_.any(this.state.config.ships, (item) => {return (item.count > 0);}));
      this.trigger(state);
    }
  },

  emitShips() {
    var {state} = this;
    var allPlaced = () => {
      return (!_.any(state.config.ships, (item) => {
        return (item.count > 0);
      }))
    };

    if (allPlaced()) {
      var toSend = state.ships.map((ship) => {
        return ship;
      });
      socket.emit(gameEvents.client.placeShips, toSend);
    }
  },

  dropShip(selected, id) {
    var {state} = this;
    var dropped;
    switch(selected.type){
      case 'config':
        dropped = getNamedShip({cells: selected.item});
        state.ships.push(dropped);
        break;
      case 'board':
      default:
        _.remove(state.ships, {id: id});
        dropped = {id: id, cells: selected};
        state.ships.push(dropped);
        break;
    }
  }
});

module.exports = SetupStore;