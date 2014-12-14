var React = require('react')
  , _ = require('lodash')
  , Reflux = require('reflux')
  , Actions = require('./actions')
  , SetupBoard = require('./SetupBoard')
  , PlayBoard = require('./PlayBoard')
  , SetupShipsPanel = require('./SetupShipsPanel')
  , GameStore = require('./stores/GameplayStore')
  , GameboardStore = require('./stores/GameboardStore');

var Game = React.createClass({
  mixins: [Reflux.ListenerMixin],

  componentDidMount: function () {
    this.listenTo(GameStore, this.switchGameState);
  },

  switchGameState: function (state) {
    if (state.phase != 'game-my-turn' && state.phase != 'game-opponents-turn') {
      this.setState(state);
    }
  },

  signIn: function () {
    var roomId = this.refs.roomId.getDOMNode().value;
    if (roomId) {
      Actions.init.signIn(roomId);
    }
  },

  placeShips: function () {
    Actions.setup.placeShips();
  },

  render: function () {
    var panel;
    if (this.state) {
      switch (this.state.phase) {
        case 'sign-in':
          panel = (
            <div className="sign-in">
              <div>
                <label className="sr-only" htmlFor="room-id">room ID</label>
                <input type='text' name='room-id' ref='roomId' placeholder='room ID' />
              </div>
              <div>
                <button type='button' className="btn btn-primary" onClick={this.signIn}>join</button>
              </div>
            </div>
          );
          break;
        case 'setup':
          panel = (
            <div className="setup">
              <div className="command">
              Place ships on the gameboard!
              </div>
              <div className="side">
                <SetupShipsPanel />
                <div className="confirm">
                  <button type='button' className="btn btn-default" onClick={this.placeShips}>
                    <span className="glyphicon glyphicon-check"></span>
                  Ready!
                  </button>
                </div>
              </div>
              <SetupBoard name={this.state.roomId} xsize={this.state.config.boardSize} ysize={this.state.config.boardSize} />
            </div>);
          break;
        case 'ready-to-shoot':
          panel = (<ShootingPanel boardSize={this.state.config.boardSize} />);
          break;
        case 'game-over':
          panel = (
            <div>
              <p>Game over!</p>
              <p>{this.state.hasWon ? "You win!" : "You lose!"}</p>
              <a href="/">Play again!</a>
            </div>
          );
          break;
        case 'player-left':
      }
    }

    return (
      <div>
        {panel}
      </div>
    );
  }
});

var ShootingPanel = React.createClass({
  mixins: [Reflux.ListenerMixin],

  componentDidMount: function () {
    this.listenTo(GameStore, this.onGamePhaseChange);
    this.listenTo(GameboardStore, this.onGameBoardChange);
    Actions.game.initGameboard();
  },

  getInitialState: function () {
    return {
      isOpponentsBoardVisible: true,
      active: false,
      previewBoard: null,
      opponentsBoard: null
    }
  },

  onGamePhaseChange: function (game) {
    var active = (game.phase == 'game-my-turn');
    this.setState({
      active: active,
      isOpponentsBoardVisible: active
    });
  },

  onGameBoardChange: function (gameboard) {
    this.setState({
      previewBoard: gameboard.previewBoard,
      shootingBoard: gameboard.shootingBoard
    });
  },

  handleSwitch: function () {
    this.setState({isOpponentsBoardVisible: !this.state.isOpponentsBoardVisible});
  },

  render: function () {
    var switchBtn = (function () {
      if (this.state.isOpponentsBoardVisible) {
        return (
          <button type="button" id="switch-board" className="btn btn-link opponent" onClick={this.handleSwitch}>
            <span className="text">Show preview</span>
            <span className="glyphicon glyphicon-chevron-right"></span>
          </button>);
      }
      else {
        return (
          <button type="button" id="switch-board" className="btn btn-link me" onClick={this.handleSwitch}>
            <span className="glyphicon glyphicon-chevron-left"></span>
            <span className="text"> Show opponent's board</span>
          </button>);
      }
    }.bind(this))();

    var cx = React.addons.classSet;
    var previewBoardClasses = cx({
      'pb': true,
      'me': true,
      'my-board-active': !this.state.isOpponentsBoardVisible
    });

    var opponentsClasses = cx({
      'pb': true,
      'opponent': true,
      'my-board-active': !this.state.isOpponentsBoardVisible
    });

    var overlay = !this.state.active ?
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
              <PlayBoard board={this.state.shootingBoard} xsize={this.props.boardSize} ysize={this.props.boardSize} />
            </div>
            <div className={previewBoardClasses}>
              <PlayBoard board={this.state.previewBoard} previewBoard xsize={this.props.boardSize} ysize={this.props.boardSize} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Game;
