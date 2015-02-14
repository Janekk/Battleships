var Reflux = require('Reflux')
  , socket = require('../socket')
  , _ = require('lodash')
  , gameEvents = require('../../game/gameEvents')
  , phase = require('../gamePhase')
  , Actions = require('../actions')
  , GamePhaseStore = require('./GamePhaseStore')
  , InvitationStore = require('./InvitationStore')
  , AppStore = require('./UserStore');

var GameEventsStore = Reflux.createStore({
  init() {

    this.listenTo(GamePhaseStore, this.setGamePhase);
    this.listenTo(InvitationStore, this.handleInvitationEvent);
    this.listenTo(AppStore, this.setUser)

    socket.on('disconnect', (status) => {
      if(status != 'forced close') {
        this.handleErrorResult({error: 'You\'ve been disconnected from the server!'});
      }
    });

    socket.on(gameEvents.server.enterLobbyStatus, (result) => {
      if(!result.isSuccessful) {
        this.handleErrorResult(result);
      }
    });

    socket.on(gameEvents.server.gameStarted, (result) => {
      result.message = 'You have joined the game!'
      this.handleStandardEvent(result);
    });

    socket.on(gameEvents.server.shipsPlaced, (result) => {
      this.handleStandardEvent(result);
    });

    socket.on(gameEvents.server.activatePlayer, (result) => {
      this.handleStandardEvent(result);
    });

    socket.on(gameEvents.server.shotUpdate, (result) => {
      if(result.shipWasHit || result.shipWasDestroyed) {
        var message = result.me ? this.opponentId +  "'s" : "Your ";
        message += result.shipWasDestroyed ? " ship was destroyed!" : " ship was hit!";

        this.trigger({
          type: result.me ? 'success' : 'info' ,
          message
        });
      }
    });

    socket.on(gameEvents.server.playerLeft, (result) => {
      this.handleStandardEvent(result, {type: 'error'});
    });
  },

  handleStandardEvent(result, opts ) {
    if(!this.handleErrorResult(result, opts)) {
      this.handleInfoResult(result, opts);
    }
  },

  handleInfoResult(result, opts) {
    var eventType = (opts && opts.type) ? opts.type : 'info';

    if (result.isSuccessful) {
      this.trigger({
        type: eventType,
        message: result.message
      });
      return true;
    }
    return false;
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

  setGamePhase(game) {
    this.phase = game.phase;
  },

  setUser(appState) {
    this.userId = appState.userId;
    this.opponentId = appState.opponentId;
  },

  handleInvitationEvent(event) {

    if(event.type == 'error') {
      return this.trigger(event);
    }

    var feedback;
    switch (event.topic) {
      case 'invitation forward':
        feedback = this.getInvitationForward(event);
        break;
      case 'invitation response':
        feedback = this.getInvitationResponse(event);
        break;
    }
    if (feedback) {
      this.trigger(feedback);
    }
  },

  getInvitationForward(response) {
    var {invitation} = response;
    if (this.userId == invitation.to) {
      return {
        type: 'info',
        header: 'New invitation',
        message: `An invitation from user ${invitation.from}.`
      }
    }
    return null;
  },

  getInvitationResponse(invitation) {
    var {state} = this;
    if (this.userId == invitation.from) {
      return {
        type: 'info',
        header: '',
        message: `User ${invitation.to} has ${invitation.accepted ? 'accepted' : 'rejected'} your invitation.`
      }
    }
    return null;
  }
});

module.exports = GameEventsStore;
