var Reflux = require('reflux');

var actions = {
  init: {
    ships: Reflux.createAction(),
    config: Reflux.createAction()
  },
  setup: {
    getConfig: Reflux.createAction(),
    selectConfigItem: Reflux.createAction(),
    selectShip: Reflux.createAction(),
    selectCell: Reflux.createAction(),
    pivotShip: Reflux.createAction()
    },
  game: null
};

module.exports = actions;
