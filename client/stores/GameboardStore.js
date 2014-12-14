var Reflux = require('Reflux')
  , Actions = require('../actions')
  , _ = require('lodash')
  , GameplayStore = require('./GameplayStore')
  , SetupStore = require('./SetupStore')
  , BoardUtils = require('../Board/BoardUtils');

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
}

var GameboardStore = Reflux.createStore({

  init() {
    this.socket = io();

    this.listenTo(Actions.game.initGameboard, this.triggerStateChange.bind(this));
    this.listenTo(GameplayStore, this.initAfterSetup);
    this.listenTo(GameplayStore, this.setGamePhase);
    this.socket.on('has shot', this.onShotReceived.bind(this));
  },

  initAfterSetup(game) {
    if(game.phase == 'ready-to-shoot') {
      this.data = new model.StoreData({
        isGameStarted: false,
        isMyTurn: false,
        previewBoard: new model.Gameboard({ships: SetupStore.state.ships}),
        shootingBoard: new model.Gameboard()
      })
    }
  },

  onShotReceived(result) {
    if (result.isSuccessful && this.data.isGameStarted) {

      var shot = new model.Shot({
        position: result.position,
        isHit: result.shipWasHit,
        isDestroyed: result.shipWasDestroyed,
        isAdjacentToShip: false
      });

      var boardToUpdate;
      if(this.data.isMyTurn) {
        boardToUpdate = this.data.shootingBoard;
        boardToUpdate.shots.push(shot);
        if(result.shipWasDestroyed) {
          boardToUpdate.ships.push(new model.Ship({
            id: result.ship.id,
            cells: result.ship.positions.map((position) => {
              return new model.ShipCell({x: position.x, y: position.y})
            })
          }));

          var adjacentCells = BoardUtils.getAdjacentCells(result.ship.positions);
          var adjacentShots = _.chain(adjacentCells)
          .filter((adjacent) => {
            return _.any(boardToUpdate.shots, (takenShot) => {
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
          boardToUpdate.shots = boardToUpdate.shots.concat(adjacentShots);
        }
      }
      else {
        boardToUpdate = this.data.previewBoard;
        boardToUpdate.shots.push(shot);
        if(shot.isHit) {
          var myShip = _.find(boardToUpdate.ships, (ship) => { return (ship.id == result.ship.id); });
          var updateCell = _.find(myShip.cells, (cell) => {
            return (cell.x == result.position.x && cell.y == result.position.y);
          });
          updateCell.isHit = true;
        }
      }
      this.triggerStateChange();
    }
  },

  triggerStateChange() {
    this.trigger(new model.StoreData({
      isGameStarted: this.data.isGameStarted,
      isMyTurn: this.data.isMyTurn,
      previewBoard: new model.Gameboard({ shots: _.filter(this.data.previewBoard.shots, (shot) =>
      {
        return !shot.isHit}), ships: this.data.previewBoard.ships
      }),
      shootingBoard: this.data.shootingBoard
    }))
  },

  setGamePhase(game) {
    if(game.phase == 'game-opponents-turn' || game.phase == 'game-my-turn' || game.phase == 'ready-to-shoot') {
      this.data.isGameStarted = true;

      if(game.phase == 'game-my-turn') {
        this.data.isMyTurn = true;
      }
      else {
        this.data.isMyTurn = false;
      }
    }
  }

});

module.exports = GameboardStore;
