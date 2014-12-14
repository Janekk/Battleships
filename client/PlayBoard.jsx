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

  getInitialState() {
    return {
      ships : []
    };
  },

  componentDidMount() {
    this.listenTo(GameplayStore, this.handleGameEvents);
  },

  handleGameEvents(game) {
    if(game.phase == 'game-my-turn') {
      this.setState({active: true});
    }
    if(game.phase == 'game-opponents-turn' || game.phase == 'ready-to-shoot') {
      this.setState({active: false});
    }
  },

  handleCellClick(cellProps) {
    var cell = {x: cellProps.x, y: cellProps.y};
    Actions.game.shoot(cell);
  },

  render() {
    var cells = [];
    for(var x = 0; x < this.props.xsize; x++) {
      for(var y = 0; y < this.props.ysize; y++) {
        var shotAtCell = this.props.board ?
          _.find(this.props.board.shots, (shot) => {
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
      };
    };

    var ships = [];
    if(this.props.board) {
      this.props.board.ships.forEach((ship, index) => {
        ships.push(<GameShip key={index} ship={ship} />)
      });
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