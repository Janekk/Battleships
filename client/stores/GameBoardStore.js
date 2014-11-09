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
    this.listenTo(ClipboardStore, this.clipboardChanged);
    this.listenTo(Actions.init.ships, this.setShips);
  },

  //TODO: make it private
  setShips: function(data) {
    this.board.ships = data.ships;
    this.trigger(this.board);
  },

  clipboardChanged: function(clipboard) {
    if(clipboard.action == 'drop') {
      if(clipboard.type == 'config') {
        this.board.ships.push({cells: clipboard.item});
        this.board.selected = clipboard.item;
      }
      else {
        var index = this.board.ships.indexOf(clipboard.item.old);
        this.board.ships.splice(index, 1);
        this.board.ships.push({cells: clipboard.item.cells});
      }
      this.trigger(this.board);
    }
  }
});

module.exports = GameBoardStore;