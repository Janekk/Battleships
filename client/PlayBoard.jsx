var React = require('react/addons')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , Cell = require('./Board/Cell')
  , Ship = require('./Board/Ship')
  , GameShip = require('./Board/GameShip')
  , GameplayStore = require('./stores/GameplayStore');

var PlayBoard = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function () {
    return {
      ships : []
    };
  },

  componentDidMount: function() {
    this.listenTo(GameplayStore, this.handleGameEvents);
  },

  handleGameEvents: function(game) {
    if(game.phase == 'game-my-turn') {
      this.setState({active: true});
    }
    if(game.phase == 'game-opponents-turn' || game.phase == 'ready-to-shoot') {
      this.setState({active: false});
    }
  },

  handleCellClick: function(cellProps) {
    var cell = {x: cellProps.x, y: cellProps.y};
    Actions.game.shoot(cell);
  },

  render: function () {
    var cells = [];
    _.times(this.props.xsize, function (x) {
      _.times(this.props.ysize, function (y) {
        var shotAtCell = this.props.board ?
          _.find(this.props.board.shots, function (shot) {
            return (shot.position.x == x && shot.position.y == y);
        }) : null;
        var canShoot = !this.props.previewBoard && !shotAtCell;
        var cellProps = {
          key: x + ' ' + y,
          x: x,
          y: y,
          shot: shotAtCell,
          onCellClick: canShoot ? this.handleCellClick.bind(this, {x: x, y: y}) : null
        };
        cells.push(<Cell {...cellProps} />);
      }.bind(this));
    }.bind(this));

    var ships = [];
    if(this.props.board) {
      this.props.board.ships.forEach(function (ship, index) {
        ships.push(<GameShip key={index} ship={ship} />)
      }.bind(this));
    }

    return (
      <div>
        <p className="status">{this.props.previewBoard ? "My board preview" : "Opponent's board" + (this.state.active ? " - YOUR TURN!!!": "") }</p>
        <div className="gameboard-table">
          <svg viewBox={"0 0 " + this.props.xsize*10 + " " + + this.props.ysize*10}>
            {cells}
            {ships}
          </svg>
        </div>
      </div>
    );
  }
});

module.exports = PlayBoard;