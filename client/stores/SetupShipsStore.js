var Reflux = require('Reflux')
  , Actions = require('../actions')
  , ClipBoardStore = require('./ClipboardStore')
  , GameStore = require('./GameStore');

var _ = require('lodash');

var ConfigurationStore = Reflux.createStore({
  init: function() {
    this.config = null;
    this.listenTo(Actions.init.setConfig, this.setData);
    this.listenTo(ClipBoardStore, this.updateConfig);
  },

  setData: function (config) {
    this.config = config.configShips;
  },

  updateConfig : function(clipboard) {
    if(clipboard.action == 'drop' && clipboard.type == 'config') {
      var ship = _.find(this.config, function (item) {
        return (item.size == clipboard.item.length);
      });
      ship.count--;
      this.trigger(this.config);
    }
  }
});

module.exports = ConfigurationStore;