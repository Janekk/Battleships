
(function initSocket() {
  var socket = require('./socket'); //init and cache socket instance
  socket.io.close();

  var GamePhaseStore = require('./stores/GamePhaseStore');
  GamePhaseStore.listen(function(game) {
    if(game.phase < phase.inLobby) {
      socket.io.close();
    };
  });
})();

var React = require('react')
  , Reflux = require('reflux')
  , Game = require('./Game')
  , phase = require('./gamePhase')
  , Actions = require('./actions')
  , UserStore = require('./stores/UserSessionStore')
  , utils = require('./utils/domUtils');

var ReactToastr = require('react-toastr');
var {ToastContainer} = ReactToastr;
var NavPanel = require('./NavPanel');
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);
var {ModalBox, ModalBoxWrapper} = require('./ModalBox');

var Body = React.createClass({
  mixins: [Reflux.listenTo(UserStore, 'onAppStateChange')],

  getInitialState() {
    return {
      showNav: false,
      app: {user: null}
    };
  },

  onAppStateChange(appState) {
    this.setState({
      showNav: this.state.showNav && !!appState.user,
      app: appState
    });
  },

  setNavPanelVisibility(e) {
    var {state, refs} = this;
    if (state.app.isPlaying && e.target == refs.navBtn.getDOMNode()) {
      this.setState({showNav: !state.showNav});
    }
    else {
      var isOutsideNav = !(e.target == refs.nav.getDOMNode()) && !utils.isElementChildOf(e.target, refs.nav.getDOMNode());

      if (isOutsideNav && this.state.showNav) {
        this.setState({showNav: false});
      }
    }
  },

  render: function () {
    var {state} = this;
    return (
      <div id="react-root" onClick={this.setNavPanelVisibility}>

        <div id="header" className="hf">
        {state.app.isPlaying ?
          <div id="nav-btn">
            <i className="fa fa-bars fa-2x" ref="navBtn" />
          </div> : null
          }
        {state.app.isPlaying ?
          <div className="user-id">
            <span>User: {state.app.user.name}
            {state.app.opponent ?
              <span>
                <span className="versus"> vs.</span> {state.app.opponent.name} </span> : null}
            </span>
          </div> : null
          }
          <NavPanel ref="nav" show={state.showNav} {...state.app} />
        {!state.app.signedIn ?
          <div className="user-id">
            <span>Please sign in</span>
          </div> : null
          }
        </div>
        <div id="main">
          <div id="game-header">
            <div className="title">
              <h1>Battleships</h1>
            </div>
            <div className="logo">
              <img className="logo" src="/images/Battleship.png" />
            </div>
          </div>
          <div>
            <ToastContainer toastMessageFactory={ToastMessageFactory} showAnimation="animated fadeIn" hideAnimation="animated fadeOut" ref="container" className="toast-top-right" />
            <Game/>
          </div>
        </div>
        <div id="footer" className="hf">
          <div className="content"> Copyright ©
            <a target="_blank" href="//janekk.github.io">&nbsp;Janekk&nbsp;</a>
            2015
          </div>
        </div>
        <div id="modal"/>
      </div>);
  },

  componentDidMount: function () {
    window.toastr = this.refs.container;
    window.modalBox = new ModalBoxWrapper(ModalBox, document.getElementById('modal'));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  React.render(<Body />, document.getElementById('app'));

  Actions.init.signInToFb();
});





