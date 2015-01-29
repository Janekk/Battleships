 var Reflux = require('Reflux')
  , socket = require('../socket')
  , Actions = require('../actions')
  , _ = require('lodash')
  , gameEvents = require('../../game/gameEvents');

var InvitationStore = Reflux.createStore({

  init() {
    socket.on(gameEvents.server.invitationRequestStatus, (result) => {
      this.handleErrorResult(result);
    });

    socket.on(gameEvents.server.invitationForward, (result) => {
      if (!this.handleErrorResult(result)) {
        this.trigger({
          type: 'info',
          topic: 'invitation forward',
          invitation: result.invitation
        })
      }
    });

    socket.on(gameEvents.server.invitationResponse, (result) => {
      if (!this.handleErrorResult(result)) {
        this.trigger({
          type: result.accepted ? 'success' : 'info',
          topic: 'invitation response',
          response: result.invitation
        })
      }
    });

    this.listenTo(Actions.init.inviteUser, this.inviteUser);
    this.listenTo(Actions.init.acceptInvitation, this.acceptInvitation);
  },

  handleErrorResult(result) {
    if (!result.isSuccessful) {
      this.trigger({
        type: 'error',
        message: result.error
      });
      return true;
    }
    return false;
  },

  inviteUser(userId) {
    socket.emit(gameEvents.client.invitationRequest, userId);
  },

  acceptInvitation(accepted, receiverId, senderId) {
    var response = {accepted: accepted, invitation: {from: senderId, to: receiverId}};
    socket.emit(gameEvents.client.invitationResponse, response);
  }
});

module.exports = InvitationStore;

