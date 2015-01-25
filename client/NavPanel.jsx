var React = require('react')
  , Reflux = require('reflux')
  , Actions = require('./actions');

var NavPanel = React.createClass({

  getDefaultProps: function () {
    return {
        show: false,
        signedIn: false,
        isPlaying: false,
        userId: null
    };
  },

  signOut(e) {
    e.preventDefault();
    if(this.props.isPlaying) {
      window.modalBox.show("Are you sure you want to quit the game and sign out?", Actions.init.signOut, {declineText: 'Continue Game'});
    }
    else {
      Actions.init.signOut();
    }
  },

  quit(e) {
    e.preventDefault();
    window.modalBox.show("Are you sure you want to quit the game?", Actions.game.quit, {declineText: 'Continue Game'});
  },

  render() {
    var {props} = this;
    return (
      <div id="side-nav" className={this.props.show ? "active-nav" : null}>
        <div className="pointer" />
        <ul id="nav-list">
          {props.isPlaying ?
            <li>
              <a href="#" onClick={this.quit}>
                <i className="fa fa-arrow-circle-left"/>
                Quit game</a>
            </li> : null}
          {props.userId ?
            <li>
              <a href="#" onClick={this.signOut}>
                <i className="fa fa-sign-out"/>
                Sign-out</a>
            </li> : null}
        </ul>
      </div>
    )
  }

});

module.exports = NavPanel;