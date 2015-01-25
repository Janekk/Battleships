var Reflux = require('reflux');

var actions = {
  common: {
    error: Reflux.createAction()
  },
  init: {
    showSignIn: Reflux.createAction(),
    signIn: Reflux.createAction(),
    inviteUser: Reflux.createAction(),
    acceptInvitation: Reflux.createAction(),
    signOut: Reflux.createAction()

  },
  setup: {
    selectConfigItem: Reflux.createAction(),
    selectShip: Reflux.createAction(),
    selectCell: Reflux.createAction(),
    pivotShip: Reflux.createAction(),
    placeShips: Reflux.createAction()
    },
  game: {
    quit: Reflux.createAction(),
    shoot: Reflux.createAction(),
    initGameboard: Reflux.createAction()
  }
};

module.exports = actions;

