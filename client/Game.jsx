var React = require('react')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , phase = require('./gamePhase')
  , GamePhaseStore = require('./stores/GamePhaseStore')
  , GameEventsStore = require('./stores/GameEventsStore')
  , FbSignInView = require('./gameViews/FbSignInView')
  , GameSignInView = require('./gameViews/GameSignInView')
  , SetupView = require('./gameViews/SetupView')
  , ShootingView = require('./gameViews/ShootingView')
  , GameOverView = require('./gameViews/GameOverView')
  , Lobby = require('./gameViews/Lobby');

var Game = React.createClass({
  mixins: [Reflux.ListenerMixin],

  componentDidMount() {
    this.listenTo(GamePhaseStore, this.switchGameState);
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
        case phase.checkingFbStatus:
          panel = (<p className="checking-fb">Please wait..</p>);
          break;
        case phase.signedOutOfGame:
          panel = (<GameSignInView />);
          break;
        case phase.signedOutOfFb:
          panel = (<FbSignInView />);
          break;
        case phase.inLobby:
          panel = (
            <div>
              <Lobby />
            </div>
          );
          break;
        case phase.setup:
          panel = (<SetupView />);
          break;
        case phase.shipsPlaced:
          panel = (<ShootingView />);
          break;
        case phase.gameOver:
          panel = (<GameOverView {...state} />);
          break;
      }
    }

    return (
      <div id="game">
        {panel}
        <audio id="audio-player"></audio>
      </div>
    );
  }
});

module.exports = Game;
