var Reflux = require('Reflux');
var Actions = require('../actions');
var ClipBoardStore = require('./ClipboardStore');

var _ = require('lodash');

var ConfigurationStore = Reflux.createStore({
  init: function() {
    this.config = null;

    this.listenTo(Actions.init.config, this.loadData);
    this.listenTo(ClipBoardStore, this.updateConfig);
  },

  loadData: function(config) {
    this.config = config;
    this.trigger(this.config);
  },

  updateConfig : function(clipboard) {
    if(clipboard.action == 'drop' && clipboard.type == 'config') {
      var ship = _.find(this.config.items, function (item) {
        return (item.size == clipboard.item.length);
      });
      ship.count--;
      this.trigger(this.config);
    }
  }
});

module.exports = ConfigurationStore;