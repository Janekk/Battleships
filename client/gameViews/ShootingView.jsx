var React = require('react')
  , Reflux = require('reflux')
  , SetStateMixin = require('../utils/SetStateMixin')
  , _ = require('lodash')
  , Actions = require('../actions')
  , phase = require('../gamePhase')
  , PlayBoard = require('./PlayBoard')
  , ConfigStore = require('../stores/ConfigStore')
  , GameStore = require('../stores/GamePhaseStore')
  , GameboardStore = require('../stores/GameboardStore');

var ShootingView = React.createClass({
  mixins: [Reflux.ListenerMixin, SetStateMixin],

  componentDidMount() {
    this.listenTo(GameStore, this.onGamePhaseChange);
    this.listenTo(GameboardStore, this.onGameStateChange);
    this.setBoardSize();
    Actions.game.initGameboard();
  },

  getInitialState() {
    return {
      boardSize: 0,
      isOpponentsBoardVisible: true,
      active: false,
      previewBoard: null,
      opponentsBoard: null,
      switched: false
    }
  },

  setBoardSize() {
    this.setState({boardSize: ConfigStore.getState().boardSize});
  },

  componentWillUnmount() {
    console.log('ShootingPanel unmount!');
  },

  onGamePhaseChange(game) {
    var active = (game.phase == phase.gameMyTurn);
    this.setStateIfMounted({
      active: active,
      isOpponentsBoardVisible: active
    });
  },

  onGameStateChange(gameboard) {
    this.setStateIfMounted({
      previewBoard: gameboard.previewBoard,
      shootingBoard: gameboard.shootingBoard,
      switched: false
    });
  },

  handleSwitch() {
    this.setState({
      isOpponentsBoardVisible: !this.state.isOpponentsBoardVisible,
      switched: true
    });
  },

  render() {
    var {state} = this;
    var switchBtn = (() => {
      if (state.isOpponentsBoardVisible) {
        return (
          <button type="button" id="switch-board" className="btn btn-link opponent" onClick={this.handleSwitch}>
            <span className="text">Show my ships </span>
            <span className="fa fa-chevron-right"></span>
          </button>);
      }
      else {
        return (
          <button type="button" id="switch-board" className="btn btn-link me" onClick={this.handleSwitch}>
            <span className="fa fa-chevron-left"></span>
            <span className="text"> Show enemy ships</span>
          </button>);
      }
    })();

    var cx = React.addons.classSet;
    var previewBoardClasses = cx({
      'pb': true,
      'me': true,
      'my-board-active': !state.isOpponentsBoardVisible,
      'switched': state.switched
    });

    var opponentsClasses = cx({
      'pb': true,
      'opponent': true,
      'my-board-active': !state.isOpponentsBoardVisible,
      'switched': state.switched
    });

    var overlay = !state.active ?
      (
        <div className="overlay">
          <span className="turn-overlay-text">Opponent's turn</span>
        </div>
      ) : null;

    return (
      <div>
        <div className="switch-wrapper">
          {switchBtn}
        </div>
        <div id="shooting-panel">
          <div>
            {overlay}
            <div className={opponentsClasses}>
              <PlayBoard board={state.shootingBoard} xsize={state.boardSize} ysize={state.boardSize} />
            </div>
            <div className={previewBoardClasses}>
              <PlayBoard board={state.previewBoard} previewBoard xsize={state.boardSize} ysize={state.boardSize} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ShootingView;
