var Reflux = require('Reflux');
var Actions = require('../actions');
var _ = require('lodash');
var ClipboardStore = require('./ClipboardStore');

var GameBoardStore = Reflux.createStore({
  init: function() {
    this.board = {
      ships: [],
      selected: null
    };
    this.listenTo(ClipboardStore, this.dropShip);
    this.listenTo(Actions.init.ships, this.loadData);
  },

  loadData: function(data) {
    this.board.ships = data.ships.map(function(ship){
      return getNamedShip(ship);
    });
    this.trigger(this.board);
  },

  dropShip: function(clipboard) {
    if(clipboard.action == 'drop') {
      if(clipboard.type == 'config') {
        var dropped = getNamedShip({cells: clipboard.item});
        this.board.ships.push(dropped);
      }
      else {
        var index = this.board.ships.indexOf(clipboard.item.old);
        this.board.ships.splice(index, 1);
        var dropped = getNamedShip(clipboard.item.ship);
        this.board.ships.push(dropped);
      }
      this.trigger(this.board);
    }
  }
});

function getNamedShip(ship) {
  return {id: ship.id ? ship.id : _.uniqueId(), cells: ship.cells};
}

module.exports = GameBoardStore;