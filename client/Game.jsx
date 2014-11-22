var React = require('react')
  , Reflux = require('reflux')
  , SetupBoard = require('./SetupBoard')
  , PlayBoard = require('./PlayBoard')
  , SetupShipsPanel = require('./SetupShipsPanel')
  , GameStore = require('./stores/GameStore')
  , Actions = require('./actions')
  , _ = require('lodash');

var GamePanel = React.createClass({
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
            <div className="panel pure-g">
              <input type='text' name='room-id' ref='roomId' placeholder='room ID' />
              <button type='button' onClick={this.signIn}>join</button>
            </div>
          );
          break;
        case 'setup':
          panel = (
            <div className="panel pure-g">
              <div className="board pure-u-4-5">
                <SetupBoard name={this.state.roomId} xsize={this.state.config.boardSize} ysize={this.state.config.boardSize} />
              </div>
              <div className="ships-panel pure-u-1-5">
                <SetupShipsPanel />
              </div>
              <div>
                <button type='button' onClick={this.placeShips}>place ships</button>
              </div>
            </div>);
          break;
        case 'ready-to-shoot':
          panel = (
            <div className="panel pure-g">
              <div className="board pure-u-1-2">
                <PlayBoard xsize={this.state.config.boardSize} ysize={this.state.config.boardSize} />
              </div>
              <div className="board pure-u-1-2">
                <PlayBoard myBoard xsize={this.state.config.boardSize} ysize={this.state.config.boardSize} />
              </div>
            </div>);
          break;
        case 'game-over':
          panel = (
            <div className="panel pure-g">
              <p>Game over!</p>
              <p>{this.state.payload}</p>
            </div>
          );
          break;
      }
    }

    return (
      <div>
        {panel}
      </div>
    );
  }
});
module.exports = GamePanel;
