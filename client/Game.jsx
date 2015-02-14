var React = require('react')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , phase = require('./gamePhase')
  , GamePhaseStore = require('./stores/GamePhaseStore')
  , GameEventsStore = require('./stores/GameEventsStore')
  , LobbyView = require('./gameViews/Lobby')
  , SignInView = require('./gameViews/SignInView')
  , SetupView = require('./gameViews/SetupView')
  , ShootingView = require('./gameViews/ShootingView')
  , GameOverView = require('./gameViews/GameOverView');

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
        case phase.signIn:
          panel = (<SignInView />);
          break;
        case phase.inLobby:
          panel = (<LobbyView />);
          break;
        case phase.setup:
          panel = (<SetupView />);
          break;
        case phase.readyToShoot:
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
      </div>
    );
  }
});

module.exports = Game;
