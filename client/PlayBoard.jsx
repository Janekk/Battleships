var React = require('react/addons')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , Cell = require('./Board/Cell')
  , Ship = require('./Board/Ship')
  , BoardStore = require('./stores/BoardStore')
  , GameStore = require('./stores/GameStore');

var GameBoard = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function () {
    return {
      ships : [],
      shots : []
    };
  },

  componentDidMount: function() {
    this.listenTo(GameStore, this.handleGameEvents);
    if(this.props.myBoard) {
      this.listenTo(BoardStore, this.loadGameBoard);
      Actions.game.getMyBoard();
    }
  },

  handleGameEvents: function(game) {
    if(game.phase == 'game-my-turn') {
      if(game.shotPosition && !this.props.myBoard) {
        this.state.shots.push(game.shotPosition);
      }
      this.setState({active: true, shots: this.state.shots});
    }
    if(game.phase == 'game-opponents-turn' || game.phase == 'ready-to-shoot') {
      if(game.shotPosition && this.props.myBoard) {
        this.state.shots.push(game.shotPosition);
      }
      this.setState({active: false, shots: this.state.shots});
    }
  },

  loadGameBoard: function(gameboard) {
    this.setState({ships: gameboard.ships});
  },

  handleCellClick: function(cellProps) {
    var cell = {x: cellProps.x, y: cellProps.y};
    Actions.game.shoot(cell);
  },

  render: function () {
    var cells = [];
    _.times(this.props.xsize, function (x) {
      _.times(this.props.ysize, function (y) {
        var cellProps = {
          key: x + ' ' + y,
          x: x,
          y: y,
          shot: _.find(this.state.shots, function (cell) {
            return (cell.x == x && cell.y == y);
          }),
          onCellClick: !this.props.myBoard ? this.handleCellClick.bind(this, {x: x, y: y}) : null
        };
        cells.push(<Cell {...cellProps} />);
      }.bind(this));
    }.bind(this));

    var ships = [];
    if(this.props.myBoard) {
      this.state.ships.forEach(function (ship, index) {
        ships.push(<Ship key={index} ship={ship} />)
      }.bind(this));
    }

    return (
      <div>
        <p>{this.props.myBoard ? "My board" : "Opponent's board" + (this.state.active ? " - YOUR TURN!!!": "") }</p>
        <div className="gameboard-table">
          <svg width="100%" height="100%" viewBox={"0 0 " + this.props.xsize*10 + " " + + this.props.ysize*10}>
            {cells}
            {ships}
          </svg>
        </div>
      </div>
    );
  }
});

module.exports = GameBoard;