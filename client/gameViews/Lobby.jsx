var React = require('react/addons')
  , Reflux = require('Reflux')
  , _ = require('lodash')
  , Actions = require('./../actions')
  , LobbyStore = require('../stores/lobby/LobbyStore')
  , {ModalBox} = require('../ModalBox');

var Lobby = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {
      user: null,
      users: [],
      userNameFilter: '',
      onlyFriends: false,
      showHints: false
    }
  },

  componentDidMount() {
    this.listenTo(LobbyStore, this.updateLobby);
  },

  updateLobby(update) {
    this.setState(update);
  },

  onSinglePlay() {
    Actions.init.playSingle(this.state.user.id);
  },

  onFilterSubmit(e) {
    e.preventDefault();
    var userNameFilter = this.refs.userNameFilter.getDOMNode().value.toLowerCase();
    if (this.state.userNameFilter != userNameFilter) {
      this.setState({userNameFilter});
    }
  },

  onFriendsFilterChange() {
    this.setState({onlyFriends: !this.state.onlyFriends});
  },

  toggleHint(e) {
    e.preventDefault();
    this.setState({showHints: !this.state.showHints});
  },

  render() {
    var {state} = this;
    return (
      <div className="lobby">
      {state.users.length > 0 ?
        <div>
          <div className="welcome">
            <p className="welcome">Welcome to the Battleships Lobby!</p>
            <p>Invite other users to the game or try the
              <button className="btn btn-primary" onClick={this.onSinglePlay}>
                Single Player Mode
              </button>
            </p>
          </div>
          <div className="content">
            <div className="header">
              <div className="question">
                <a href="" onClick={this.toggleHint}><i className="fa fa-question-circle"></i></a>
              </div>
              <div className="user-filter">
                <input type="text" ref="userNameFilter" placeholder="Search.." className="name-filter" onKeyUp={this.onFilterSubmit}></input>
                <FancyCheckbox id="friends-filter" label="Only friends" onChange={this.onFriendsFilterChange}/>
              </div>
            </div>
            <UserList {...state}>
            {state.showHints ?
              <ModalBox mode="ok" question="How to use the Lobby" decline={this.toggleHint.bind(this)}>
                <img src="/images/explanation.png" />
              </ModalBox>
              : null
              }
            </UserList>
          </div>
          <div className="ad">
            <p>Check out the standalone version for mobile browsers at &nbsp;
              <a href="http://battleships.mobi" target="_blank">Battleships.mobi</a>
              !</p>

            <a href="http://battleships.mobi" target="_blank">
              <img src="/images/preview.png" />
            </a>
          </div>

        </div>
        :
        <div className="no-user">
          <p>There are currently no other users in the lobby.</p>
          <p>Please wait or invite a friend!</p>
          <div className="single-player">You can also play in
            <button className="btn btn-primary" onClick={this.onSinglePlay}>
              Single Player Mode
            </button>
          </div>
        </div>
        }
      </div>
    );
  }
});

var UserList = React.createClass({

  handleFbInvitationClick(user) {
    Actions.init.inviteFriend(user.id);
  },

  handleGameInvitationClick(user) {
    if (user.hasInvited) {
      Actions.init.acceptInvitation(true, this.props.user.id, user.id);
    }
    else {
      Actions.init.inviteUser(user.id);
    }
  },

  render() {
    var {props} = this, items = [];
    var isActiveSection = false, isInActiveSection = false;
    _(props.users)
      .filter((user) => {
        var namePass = (user.name.toLowerCase().indexOf(props.userNameFilter) > -1);
        var friendPass = props.onlyFriends ? user.isFriend : true;
        return (namePass && friendPass);
      })
      .forEach((user) => {
        if (user.isActive) {
          if (!isActiveSection) {
            items.push(<div key="active" className="active sub-header">Online users:</div>);
            isActiveSection = true;
          }
          items.push(<ActiveUserItem key={user.id} user={user} onInvitationClick={this.handleGameInvitationClick.bind(this, user)}/>);
        }
        else {
          if (!isInActiveSection) {
            items.push(<div key="inactive" className="inactive sub-header">Friends (offline):</div>);
            isInActiveSection = true;
          }
          items.push(<InactiveUserItem key={user.id} user={user} onInvitationClick={this.handleFbInvitationClick.bind(this, user)}/>);
        }
      })
      .value();

    return (
      <div className="user-list">
        {this.props.children}
        <ul className="user-list-scroll">
          {items}
        </ul>
      </div>);
  }
});

var InactiveUserItem = React.createClass({
  render() {
    var {props} = this;

    return (
      <li className="user-item inactive">
        { props.user.picture ?
          <img className="fb-image" src={props.user.picture.data.url} /> : null }
        <div className="user-name">{props.user.name}</div>
        <div className="user-invitation">
          <div>
            <button className="btn btn-primary" onClick={props.onInvitationClick}>
              Invite to Lobby
            </button>
          </div>
          {props.user.gotFbInvitation ?
            <div className="fb-confirmation">Invitation has been sent!</div> : null
          }
        </div>
      </li>
    );
  }
});

var ActiveUserItem = React.createClass({
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
          return 'Invite to play';
        }
      }
    };

    var itemClasses = React.addons.classSet({
      'user-item': true,
      'active': true,
      'playing': props.user.isPlaying
    });

    var btnDisabled = props.user.gotInvitation || props.user.isPlaying;
    return (
      <li className={itemClasses}>
      { props.user.picture ?
        <img className="fb-image" src={props.user.picture.data.url} /> : null }
      { !props.user.isFriend ?
        <div className="non-friend">{"?"}</div> : null }
        <div className="user-name">{props.user.name}</div>
        <div className="user-invitation">
          <button className="btn btn-primary" onClick={props.onInvitationClick} disabled={btnDisabled}>
            {getCaption()}
          </button>
        </div>
      </li>
    );
  }
});

var FancyCheckbox = React.createClass({
  render() {
    var {props} = this;
    return (
      <div className={props.id}>
        <div className="checkbox">
          <input type="checkbox" id={props.id} onChange={props.onChange} />
          <label htmlFor={props.id}></label>
        </div>
        <label htmlFor={props.id}>{props.label}</label>
      </div>
    );
  }
});


module.exports = Lobby;