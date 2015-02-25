var _ = require('lodash')
  , messageHelper = require('./messageHelper')
  , validator = require('./Validator');

var Lobby = function () {
  var users = [];
  var invitations = [];

  function getLobbyState() {
    return {users: users, invitations: invitations};
  };

  function findUser(id) {
    return _.find(users, {id: id});
  }

  this.getLobbyState = function () {
    return getLobbyState();
  };

  this.reenterLobby = function (userId) {
    if (!userId) {
      return messageHelper.toResult(new Error('User name is empty.'));
    }

    var storedUser = _.find(users, {id: userId});
    storedUser.isPlaying = false;
    return messageHelper.toResult({user: storedUser});
  };
  //TODO JK: temporary change
  this.enterLobby = function (user) {
    if (!user.id) {
      return messageHelper.toResult(new Error('User ID is empty.'));
    }

    var storedUser = _.find(users, {id: user.id});
    if (storedUser) { // username already exists
      return messageHelper.toResult(new Error('The username already exists.'));
    }
    // join lobby
    users.push(user);
    return messageHelper.toResult({user: user});
  };

  this.leaveLobby = function (userId, startsPlay) {
    if (!userId) {
      return messageHelper.toResult(new Error('User name is empty.'));
    }

    var storedUser = findUser(userId);
    if (!storedUser) {
      return messageHelper.toResult(new Error('User with the given ID doesn\'t exist.'));
    }

    // join lobby
    var user = {id: userId};
    if (!startsPlay) {
      _.remove(users, user);
      _.remove(invitations, {from: userId});
      _.remove(invitations, {to: userId});
    }
    else {
      storedUser.isPlaying = true;
    }
    return messageHelper.OK();
  };

  this.inviteUser = function (userId, invitingUserId) {
    var invitingUser = _.find(users, {id: invitingUserId});
    if (!invitingUser) { // user isn't in lobby
      return messageHelper.toResult(new Error('You\'re not in the lobby.'));
    }

    if (userId === invitingUserId) { // self invitation
      return messageHelper.toResult(new Error('You can\'t invite yourself!'));
    }

    var user = _.find(users, {id: userId});
    if (!user) {
      return messageHelper.toResult(new Error('User not found in lobby!'));
    }

    var invitation = {from: invitingUserId, to: userId};
    if (_.find(invitations, invitation)) {
      return messageHelper.toResult(new Error('The user has already an invitation from you.'));
    }

    invitations.push(invitation);
    return messageHelper.toResult({invitation: {from: invitingUser, to: user}});
  };

  this.acceptInvitation = function (accepted, invitation) {
    if (accepted) {
      if (!_.find(invitations, invitation)) {
        return messageHelper.toResult(new Error('You\'re not invited by this user!'));
      }
      var from = _.find(users, {id: invitation.from});
      var to = _.find(users, {id: invitation.to});

      from.isPlaying = true;
      to.isPlaying = true;

      _.remove(invitations, invitation);
    }
    return messageHelper.toResult({invitation: {
      accepted: accepted,
      from: from,
      to: to
    }});
  }
};

module.exports = Lobby;