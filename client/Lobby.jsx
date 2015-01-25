var React = require('react/addons')
  , Reflux = require('Reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , LobbyStore = require('./stores/LobbyStore');

var Lobby = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {
      userId: null,
      users: []
    }
  },

  componentDidMount() {
    this.listenTo(LobbyStore, this.updateLobby);

    this.updateLobby(LobbyStore.state);
  },

  updateLobby(update) {
    this.setState(update);
  },

  handleInvitationClick: function (user) {
    var {state} = this;
    if (user.hasInvited) {
      Actions.init.acceptInvitation(true, state.userId, user.id);
    }
    else {
      Actions.init.inviteUser(user.id);
    }
  },

  render() {
    var {state} = this, items = [];
    state.users.forEach((user) => {
      if (user.id != state.userId) {
        items.push(<UserItem key={user.id} onInvitationClick={this.handleInvitationClick.bind(this, user)} user={user}/>);
      }
    });
    return (
      <div className="lobby">
      {items.length > 0 ?
        <div>
          <div className="header">
            <p>Invite other users or accept an invitation to start playing!</p>
          </div>

          <div className="content">
            <div className="header">Signed-in users:</div>
            <div className="user-list">
              <ul className="user-list-scroll">
          {items}
              </ul>
            </div>
          </div>
        </div>
        :
        <div className="no-user">
          <p>There are currently no other users in the lobby.</p>
          <p>Please wait or invite a friend!</p>
        </div>
        }
      </div>
    );
  }
});


var UserItem = React.createClass({
  render() {
    var {props} = this;

    var getCaption = () => {
      if (props.user.isPlaying) {
        return 'Is playing..';
      }
      else {
        if (props.user.hasInvited) {
          return 'Accept invitation';
        }
        else if (props.user.gotInvitation) {
          return 'Invitation sent';
        }
        else {
          return 'Invite';
        }
      }
    };

    var itemClasses = React.addons.classSet({
      'user-item': true,
      'playing': props.user.isPlaying
    });

    var btnDisabled = props.user.gotInvitation || props.user.isPlaying;
    return (
      <li className={itemClasses}>
        <div className="user-name">{props.user.id}</div>
        <div className="user-invitation">
          <button className="btn btn-primary" onClick={props.onInvitationClick} disabled={btnDisabled}>
            {getCaption()}
          </button>
        </div>
      </li>
    );
  }
});

module.exports = Lobby;