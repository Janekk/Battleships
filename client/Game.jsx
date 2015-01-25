var React = require('react')
  , SetStateMixin = require('./SetStateMixin')
  , _ = require('lodash')
  , Actions = require('./actions')
  , SetupBoard = require('./SetupBoard')
  , PlayBoard = require('./PlayBoard')
  , ConfigPanel = require('./ConfigPanel')
  , phase = require('./GameStates')
  , Reflux = require('reflux')
  , SetupStore = require('./stores/SetupStore')
  , ConfigStore = require('./stores/ConfigStore')
  , GameStore = require('./stores/GameplayStore')
  , GameboardStore = require('./stores/GameboardStore')
  , GameEventsStore = require('./stores/GameEventsStore')
  , Lobby = require('./Lobby');

var SignInPanel = React.createClass({

  signIn(e) {
    e.preventDefault();
    var userName = this.refs.userName.getDOMNode().value;
    if (userName) {
      Actions.init.signIn(userName);
    }
  },

  render() {
    return (
      <div className="sign-in">
        <form onSubmit={this.signIn}>
          <div>
            <label className="sr-only" htmlFor="user-name">User name</label>
            <input type='text' name='user-name' ref='userName' placeholder='User name' autoFocus='autofocus' />
          </div>
          <div>
            <button type='submit' className="btn btn-primary">Join!</button>
          </div>
        </form>
      </div>);
  }
})

var SetupPanel = React.createClass({
  mixins: [Reflux.listenTo(SetupStore, 'onSetupStateChange')],

  onSetupStateChange(setup) {
    this.setState({setup});
  },

  componentWillMount() {
    this.onSetupStateChange(SetupStore.getState());
  },

  placeShips() {
    Actions.setup.placeShips();
  },

  render() {
    return (
      <div className="setup">
        {this.state.setup.config ?
          <div>
            <div className="command">
              Place ships on the gameboard by selecting a ship and clicking on a target field. Double-click to pivot the ship.
            </div>
            <div className="side">
              <div className="confirm">
                <button type='button' className="btn btn-default" disabled={!this.state.setup.allPlaced} onClick={this.placeShips}>
                  <span className="fa fa-check"></span>
                  Ready!
                </button>
              </div>
              <ConfigPanel setup={this.state.setup} />
            </div>
            <SetupBoard setup={this.state.setup} />
          </div> : null}
      </div>);
  }
});

var ShootingPanel = React.createClass({
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

var GameOverPanel = React.createClass({

  render() {
    var {props} = this;
    return (
      <div className="game-over">
        <p>Game over!</p>
        <p className={props.hasWon ? "win" : "lose"}>{props.hasWon ? "You win!" : "You lose!"}</p>
        <button type="button" className="btn btn-primary" onClick={Actions.game.quit}>
          Play again!
        </button>
      </div>);
  }
})

var Game = React.createClass({
  mixins: [Reflux.ListenerMixin],

  componentDidMount() {
    this.listenTo(GameStore, this.switchGameState);
    this.listenTo(Actions.common.error, function (message) {
      this.showGameEvent({type: 'error', message});
    });
    this.listenTo(GameEventsStore, this.showGameEvent);
  },

  showGameEvent(event) {
    window.toastr[event.type](event.message, event.header, {
      showAnimation: 'animated fadeIn',
      hideAnimation: 'animated fadeOut'
    });
  },

  switchGameState(state) {
    if (state.phase != phase.gameMyTurn && state.phase != phase.gameOpponentsTurn) {
      this.setState(state);
    }
  },

  render() {
    var panel, {state} = this;
    if (state) {
      switch (state.phase) {
        case phase.signIn:
          panel = (<SignInPanel />);
          break;
        case phase.inLobby:
          panel = (<Lobby />);
          break;
        case phase.setup:
          panel = (<SetupPanel />);
          break;
        case phase.readyToShoot:
          panel = (<ShootingPanel />);
          break;
        case phase.gameOver:
          panel = (<GameOverPanel {...state} />);
          break;
      }
    }

    return (
      <div id="game">
        {panel}
      </div>
    );
  }
});

module.exports = Game;
