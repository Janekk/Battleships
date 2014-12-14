var Reflux = require('reflux');

var actions = {
  init: {
    startGame: Reflux.createAction(),
    signIn: Reflux.createAction(),
    setConfig: Reflux.createAction()
  },
  setup: {
    selectConfigItem: Reflux.createAction(),
    selectShip: Reflux.createAction(),
    selectCell: Reflux.createAction(),
    pivotShip: Reflux.createAction(),
    placeShips: Reflux.createAction()

    },
  game: {
    shoot: Reflux.createAction(),
    initGameboard: Reflux.createAction()
  }
};

module.exports = actions;

