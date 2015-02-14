var React = require('react/addons')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./../actions')
  , {Cell, Hit} = require('./board/Cell')
  , Ship = require('./board/Ship')
  , GameShip = require('./board/GameShip')
  , GamePhaseStore = require('./../stores/GamePhaseStore')
  , phase = require('./../gamePhase');

var PlayBoard = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {active: false};
  },

  componentDidMount() {
    this.listenTo(GamePhaseStore, this.handleGameEvents);
  },

  handleGameEvents(game) {
    if (game.phase == phase.gameMyTurn) {
      this.setState({active: true});
    }
    if (game.phase == phase.gameOpponentsTurn || game.phase == phase.readyToShoot) {
      this.setState({active: false});
    }
  },

  handleCellClick(cellProps) {
    var cell = {x: cellProps.x, y: cellProps.y};
    Actions.game.shoot(cell);
  },

  render() {
    var cells = [], ships = [], hits = [], {props} = this, {board} = props;
    if (board) {
      for (var x = 0; x < props.xsize; x++) {
        for (var y = 0; y < props.ysize; y++) {
          var shotAtCell =  _.find(board.shots, (shot) => { return (shot.position.x == x && shot.position.y == y); });
          var canShoot = !props.previewBoard && !shotAtCell;
          var cellProps = {
            key: x + ' ' + y,
            x: x,
            y: y,
            shot: shotAtCell,
            onCellClick: canShoot ? this.handleCellClick.bind(this, {x: x, y: y}) : null,
            update: (board.update == shotAtCell)
          };
          cells.push(<Cell {...cellProps} />);
        }
      }

      _.chain(board.shots)
        .filter({isHit: true})
        .forEach((shot) => {
          hits.push(<Hit x={shot.position.x} y={shot.position.y} update={board.update == shot} />);
      });

      board.ships.forEach((ship, index) => {
        ships.push(<GameShip key={index} update={board.update == ship} ship={ship} />)
      });
    }

    return (
      <div>
        <p className="status">
          {this.props.previewBoard ? "My ships" : "Enemy ships"}
          {(!this.props.previewBoard && this.state.active) ?
            <span className="shoot"> - SHOOT!</span> : null
            }
        </p>
        <div className="board play">
          <svg viewBox={"0 0 " + this.props.xsize * 10 + " " + +this.props.ysize * 10}>
            {cells}
            {hits}
            {ships}
          </svg>
        </div>
      </div>
    );
  }
});

module.exports = PlayBoard;