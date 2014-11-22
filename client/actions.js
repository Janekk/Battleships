var Reflux = require('reflux');

var actions = {
  init: {
    startGame: Reflux.createAction(),
    signIn: Reflux.createAction(),
    ships: Reflux.createAction(),
    getConfig: Reflux.createAction()
  },
  setup: {
    getConfig: Reflux.createAction(),
    selectConfigItem: Reflux.createAction(),
    selectShip: Reflux.createAction(),
    selectCell: Reflux.createAction(),
    pivotShip: Reflux.createAction(),
    placeShips: Reflux.createAction()

    },
  game: {
    getMyBoard: Reflux.createAction(),
    shoot: Reflux.createAction()
  }
};

module.exports = actions;
