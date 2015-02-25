var Reflux = require('Reflux')
  , _ = require('lodash')
  , socket = require('../../socket')
  , Actions = require('../../actions')
  , gameEvents = require('../../../game/gameEvents')
  , phase = require('../../gamePhase')
  , GamePhaseStore = require('./../GamePhaseStore')
  , UserStore = require('./../UserSessionStore')
  , FacebookStore = require('../FacebookStore');

var LobbyStore = Reflux.createStore({

  init() {

    this.state = {
      user: null,
      users: []
    };
    this.gameUsers = [];
    this.friends = [];

    this.listenTo(FacebookStore, this.updateFriends);
    this.listenTo(GamePhaseStore, this.resetOnSignIn);
    this.listenTo(UserStore, this.setUser);

    socket.on(gameEvents.server.lobbyUpdate, (update) => {
      var {state} = this;
      update.users.forEach((user) => {
        user.hasInvited = !!_.find(update.invitations, {from: user.id, to: state.user.id});
        user.gotInvitation = !!_.find(update.invitations, {to: user.id, from: state.user.id});
      });

      this.gameUsers = update.users;
      this.triggerUpdate();
    });

    socket.on(gameEvents.server.invitationForward, (data) => {
      var invitingUser = _.find(this.gameUsers, {id: data.invitation.from.id});
      invitingUser.hasInvited = true;
      this.triggerUpdate();
    });

    socket.on(gameEvents.server.invitationRequestStatus, (status) => {
      if (status.isSuccessful) {
        var invitedUser = _.find(this.gameUsers, {id: status.invitation.to.id});
        invitedUser.gotInvitation = true;
        this.triggerUpdate();
      }
    });
  },

  resetOnSignIn(game) {
    if (game.phase < phase.inLobby) {
      this.state.users = [];
      this.gameUsers = [];
      this.friends = [];
    }
  },

  setUser (sessionState) {
    this.state.user = sessionState.user;
  },

  updateActiveUsers(data) {
    this.state.user = data.user;
    this.gameUsers = data.users;
    this.triggerUpdate();
  },

  updateFriends(fbState) {
    this.friends = fbState.friends;
    this.triggerUpdate();
  },

  triggerUpdate() {
    var inactiveFriends = this.friends.slice();
    var activeUsers = this.gameUsers.slice();
    var result = [];
    this.gameUsers.forEach((user) => {
      if(user.id != this.state.user.id) {
        var matchedFriend = _.find(inactiveFriends, {id: user.id});
        if (matchedFriend) {
          _.remove(inactiveFriends, matchedFriend);
        }
        result.push(_.extend(user, matchedFriend, {isActive: true, isFriend: !!matchedFriend}));
      }
    });

    inactiveFriends.forEach((friend) => {
      result.push(_.extend(friend, {isActive: false, isFriend: true}));
    });

    this.state.users = result;
    this.trigger(this.state);
  }
});

module.exports = LobbyStore;

