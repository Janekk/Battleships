var React = require('react')
  , Reflux = require('reflux')
  , SetupBoard = require('./SetupBoard')
  , PlayBoard = require('./PlayBoard')
  , SetupShipsPanel = require('./SetupShipsPanel')
  , GameStore = require('./stores/GameStore')
  , Actions = require('./actions')
  , _ = require('lodash');

var Game = React.createClass({
  mixins: [Reflux.ListenerMixin],

  componentDidMount: function () {
    this.listenTo(GameStore, this.switchGameState);
  },

  switchGameState: function (state) {
    if(state.phase != 'game-my-turn' && state.phase != 'game-opponents-turn') {
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
            <form className="form-inline sign-in" role="form">
              <div className="form-group">
                <div className="input-group">
                  <label className="sr-only" htmlFor="room-id">room ID</label>
                  <input type='text' className="form-control" name='room-id' ref='roomId' placeholder='room ID' />
                </div>
              </div>
              <button type='button' className="btn btn-primary" onClick={this.signIn}>join</button>
            </form>
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
                    <span className="glyphicon glyphicon-check"></span> Ready!
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
              <p>{this.state.payload}</p>
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

  componentDidMount: function() {
    this.listenTo(GameStore, this.handleGameEvents);
  },

  getInitialState: function() {
    return {
      isOpponentsBoardVisible: true,
      active: false
    }
  },

  handleGameEvents: function(game) {
    var active = (game.phase == 'game-my-turn');
    this.setState({
      active: active,
      isOpponentsBoardVisible: active
    });
  },

  handleSwitch: function() {
    this.setState({isOpponentsBoardVisible: !this.state.isOpponentsBoardVisible});
  },

  render: function() {
    var switchBtn = (function(){
      if(this.state.isOpponentsBoardVisible) {
        return(
          <button type="button" id="switch-board" className="btn btn-link opponent" onClick={this.handleSwitch}>
            <span className="text">Show my board </span>
            <span className="glyphicon glyphicon-chevron-right"></span>
          </button>);
      }
      else {
        return(
          <button type="button" id="switch-board" className="btn btn-link me" onClick={this.handleSwitch}>
            <span className="glyphicon glyphicon-chevron-left"></span>
            <span className="text"> Show opponent's board</span>
          </button>);
      }
    }.bind(this))();

    var cx = React.addons.classSet;
    var myBoardClasses = cx({
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
              <PlayBoard xsize={this.props.boardSize} ysize={this.props.boardSize} />
            </div>
            <div className={myBoardClasses}>
              <PlayBoard myBoard xsize={this.props.boardSize} ysize={this.props.boardSize} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Game;
