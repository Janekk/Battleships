var React = require('react')
  , Actions = require('../actions')
  , phase = require('../gamePhase');

var GameSignInView = React.createClass({

  signIn(e) {
      Actions.init.signInToGame();
  },

  render() {
    return (
      <div className="sign-in">
        <p>You have been disconnected from the Battleships lobby. </p>
        <button className="btn btn-primary" onClick={this.signIn}>Sign in again</button>
      </div>);
  }

});

module.exports = GameSignInView;
