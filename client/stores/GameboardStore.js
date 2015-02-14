var Reflux = require('Reflux')
  , socket = require('../socket')
  , Actions = require('../actions')
  , _ = require('lodash')
  , GamePhaseStore = require('./GamePhaseStore')
  , SetupStore = require('./SetupStore')
  , BoardUtils = require('../../game/BoardUtils')
  , phase = require('../gamePhase')
  , gameEvents = require('../../game/gameEvents');

var model = {
  Gameboard: function(props) {
    props = props || {};
    this.ships = props.ships || [];
    this.shots = props.shots || [];
  },

  Ship: function(props) {
    props = props || {};
    this.id = props.id || null;
    this.cells = props.cells || [];
  },

  ShipCell: function(props) {
    props = props || {};
    this.x = props.x;
    this.y = props.y;
    this.isHit = props.isHit;
  },

  Shot: function(props) {
    props = props || {};
    this.position = props.position;
    this.isHit = props.isHit;
    this.isAdjacentToShip = props.isAdjacentToShip;
  },

  PreviewShot: function(props) {
    props = props || {};
    this.position = props.position;
    this.isHit = props.isHit;
  },

  StoreData: function(props) {
    props = props || {};
    this.isGameStarted = props.isGameStarted;
    this.isMyTurn = props.isMyTurn;
    this.previewBoard = props.previewBoard;
    this.shootingBoard = props.shootingBoard;
  }
};

var GameboardStore = Reflux.createStore({
  init() {

    this.listenTo(Actions.game.initGameboard, this.triggerStateChange);
    this.listenTo(GamePhaseStore, this.initAfterSetup);
    this.listenTo(GamePhaseStore, this.setGamePhase);
    socket.on(gameEvents.server.shotUpdate, this.onShotReceived);
  },

  initAfterSetup(game) {
    if(game.phase == phase.readyToShoot) {
      this.state = new model.StoreData({
        isGameStarted: false,
        isMyTurn: false,
        previewBoard: new model.Gameboard({ships: SetupStore.state.ships}),
        shootingBoard: new model.Gameboard()
      })
    }
  },

  onShotReceived(result) {
    var {state} = this;
    if (result.isSuccessful && state.isGameStarted) {

      var shot = new model.Shot({
        position: result.position,
        isHit: result.shipWasHit,
        isDestroyed: result.shipWasDestroyed,
        isAdjacentToShip: false
      });

      var board;
      if(state.isMyTurn) {
        board = state.shootingBoard;
        board.shots.push(shot);
        if(result.shipWasDestroyed) {
          board.ships.push(new model.Ship({
            id: result.ship.id,
            cells: result.ship.positions.map((position) => {
              return new model.ShipCell({x: position.x, y: position.y})
            })
          }));

          var adjacentCells = BoardUtils.getAdjacentCells(result.ship.positions);
          var adjacentShots = _.chain(adjacentCells)
          .filter((adjacent) => {
            return _.any(board.shots, (takenShot) => {
              return !(takenShot.position.x == adjacent.x && takenShot.position.y == adjacent.y);
            })
          })
          .map((adj) => { return new model.Shot({
            position: {x: adj.x, y: adj.y},
            isHit: false,
            isDestroyed: false,
            isAdjacentToShip: true
          })})
          .value();
          board.shots = board.shots.concat(adjacentShots);
        }
      }
      else {
        board = state.previewBoard;

        board.shots.push(shot);
        if(shot.isHit) {
          var myShip = _.find(board.ships, (ship) => { return (ship.id == result.ship.id); });
          var updateCell = _.find(myShip.cells, (cell) => {
            return (cell.x == result.position.x && cell.y == result.position.y);
          });
          updateCell.isHit = true;
          board.update = myShip;
        }
        else {
          board.update = shot;
        }
      }
      this.triggerStateChange();
    }
  },

  triggerStateChange() {
    var {state} = this;
    this.trigger(new model.StoreData({
      isGameStarted: state.isGameStarted,
      isMyTurn: state.isMyTurn,
      previewBoard: {
        shots: _.filter(state.previewBoard.shots, (shot) => {return !shot.isHit}),
        ships: state.previewBoard.ships,
        update: state.previewBoard.update
      },
      shootingBoard: state.shootingBoard
    }))
  },

  setGamePhase(game) {
    if(game.phase == phase.gameOpponentsTurn || game.phase == phase.gameMyTurn || game.phase == phase.readyToShoot) {
      this.state.isGameStarted = true;

      if(game.phase == phase.gameMyTurn) {
        this.state.isMyTurn = true;
      }
      else {
        this.state.isMyTurn = false;
      }
    }
  }
});

module.exports = GameboardStore;
