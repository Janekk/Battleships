var Reflux = require('Reflux')
  , Actions = require('../actions')
  , _ = require('lodash')
  , ClipboardStore = require('./ClipboardStore');

var GameBoardStore = Reflux.createStore({
  init: function() {
    this.board = {
      ships: [],
      selected: null
    };
    this.listenTo(ClipboardStore, this.dropShip);
    this.listenTo(Actions.setup.placeShips, this.emitShips);
    this.listenTo(Actions.game.getMyBoard, this.getBoard);
  },

  emitShips: function () {
    var socket = io();
    var toSend = this.board.ships.map(function(ship) {
      return ship.cells;
    });
    socket.emit('place ships', toSend);
  },

  getBoard: function() {
    this.trigger(this.board);
  },

  dropShip: function(clipboard) {
    if(clipboard.action == 'drop') {
      var dropped;
      if(clipboard.type == 'config') {
        dropped = getNamedShip({cells: clipboard.item});
        this.board.ships.push(dropped);
      }
      else {
        var index = this.board.ships.indexOf(clipboard.item.old);
        this.board.ships.splice(index, 1);
        dropped = getNamedShip(clipboard.item.ship);
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