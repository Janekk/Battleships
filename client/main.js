
(function initSocket() {
  var socket = require('./socket'); //init and cache socket instance
  socket.io.close();

  var GamePhaseStore = require('./stores/GamePhaseStore');

  GamePhaseStore.listen(function(game) {
    if(game.phase == phase.signIn) {
      //close socket when not signed-in
      socket.io.close();
    };
  });
})();

var React = require('react')
  , Reflux = require('reflux')
  , Game = require('./Game')
  , phase = require('./gamePhase')
  , Actions = require('./actions')
  , AppStore = require('./stores/UserStore')
  , utils = require('./utils/domUtils');

var ReactToastr = require('react-toastr');
var {ToastContainer} = ReactToastr;
var NavPanel = require('./NavPanel');
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);
var ModalBox = require('./ModalBox');

var Body = React.createClass({
  mixins: [Reflux.listenTo(AppStore, 'onAppStateChange')],

  getInitialState() {
    return {
      showNav: false,
      app: {userId: null}
    };
  },

  onAppStateChange(appState) {
    this.setState({
      showNav: this.state.showNav && !!appState.userId,
      app: appState
    });
  },

  setNavPanelVisibility(e) {
    var {state, refs} = this;
    if (state.app.signedIn && e.target == refs.navBtn.getDOMNode()) {
      this.setState({showNav: !state.showNav});
    }
    else {
      var isOutsideNav = !(e.target == refs.nav.getDOMNode()) && !utils.isElementChildOf(e.target, refs.nav.getDOMNode());

      if (isOutsideNav) {
        this.setState({showNav: false});
      }
    }
  },

  render: function () {
    var {state} = this;
    return (
      <div id="react-root" onClick={this.setNavPanelVisibility}>

        <div id="header" className="hf">
        {state.app.signedIn ?
          <div id="nav-btn">
            <i className="fa fa-bars fa-2x" ref="navBtn" />
          </div> : null
          }
        {state.app.signedIn ?
          <div className="user-id">
            <span>User: {state.app.userId}
            {state.app.opponentId ?
              <span>
                <span className="versus"> vs.</span> {state.app.opponentId} </span> : null}
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
          <div className="social">
            <div className="g-plus" data-action="share" data-annotation="none"></div>
            <a href="https://twitter.com/share" className="twitter-share-button" data-count="none">Tweet</a>
            <div className="fb-share-button" data-layout="button"></div>
          </div>
          <div className="content"> ©
            <a target="_blank" href="//janekk.github.io">&nbsp;Janekk&nbsp;</a>
            2015
          </div>
        </div>
        <ModalBox ref="modal"/>
      </div>);
  },

  componentDidMount: function () {
    window.toastr = this.refs.container;
    window.modalBox = this.refs.modal;
  }
});

document.addEventListener('DOMContentLoaded', () => {

  React.render(<Body />, document.getElementById('app'));

  Actions.init.showSignIn();
});





