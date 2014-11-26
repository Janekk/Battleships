var React = require('react/addons')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , Cell = require('./Board/Cell')
  , Ship = require('./Board/Ship')
  , SetupStore = require('./stores/SetupStore')
  , GameStore = require('./stores/GameStore');

var PlayBoard = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function () {
    return {
      ships : [],
      shots : []
    };
  },

  componentDidMount: function() {
    this.listenTo(GameStore, this.handleGameEvents);
    this.listenTo(SetupStore, this.loadGameBoard);

    //initial load
    this.loadGameBoard(SetupStore.data.ships);
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

  loadGameBoard: function(ships) {
    this.setState({ships: ships});
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
        <p>{this.props.myBoard ? "My board (preview)" : "Opponent's board" + (this.state.active ? " - YOUR TURN!!!": "") }</p>
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