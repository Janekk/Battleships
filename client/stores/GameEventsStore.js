var Reflux = require('Reflux')
  , socket = require('../socket')
  , _ = require('lodash')
  , gameEvents = require('../../game/gameEvents')
  , phase = require('../gamePhase')
  , Actions = require('../actions')
  , GamePhaseStore = require('./GamePhaseStore')
  , InvitationStore = require('./lobby/InvitationStore')
  , UserStore = require('./UserSessionStore');

var GameEventsStore = Reflux.createStore({
  init() {

    this.listenTo(GamePhaseStore, this.setGamePhase);
    this.listenTo(InvitationStore, this.handleInvitationEvent);
    this.listenTo(UserStore, this.setUser);

    socket.on('disconnect', (status) => {
      if(status != 'forced close') {
        this.handleErrorResult({error: 'You\'ve been disconnected from the game server!'});
      }
    });

    socket.on('connect_error', this.showConnectionStatus);
    socket.on('connect_timeout', this.showConnectionStatus);

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
        var message = result.me ? this.getOpponentName() +  "'s" : "Your ";
        message += result.shipWasDestroyed ? " ship was destroyed!" : " ship was hit!";

        this.trigger({
          type: result.me ? 'success' : 'info' ,
          message
        });

        var audio = document.getElementById('audio-player');
        audio.src="/sounds/Blast.mp3";
        audio.play();

        if(result.shipWasDestroyed) {
          audio.addEventListener("ended", function playSunk() {
            audio.src = "/sounds/Bubbling.mp3";
            audio.play();
            audio.removeEventListener("ended", playSunk);
          });
        }
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
    this.user = appState.user;
    this.fbUser = appState.fbUser;
    this.opponent = appState.opponent;
  },

  getUserId() {
    return (this.user) ? this.user.id : null;
  },

  getOpponentName() {
    return (this.opponent) ? this.opponent.name : null;
  },

  showConnectionStatus() {
    if(this.fbUser) {
      // socket.io triggers connect error also if socket is closed (in this case before user is authenticated with FB),
      // therefore prevent the error from showing if the user is not logged in to FB
      this.handleErrorResult({error: 'Could not connect to the game server!'});
    }
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

  getInvitationForward(forward) {
    var {invitation} = forward;
    if (this.getUserId()  == invitation.to.id) {

      var audio = document.getElementById('audio-player');
      audio.src="/sounds/Notification.mp3";
      audio.play();

      return {
        type: 'info',
        header: 'New invitation',
        message: `An invitation from user ${invitation.from.name}.`
      }
    }
    return null;
  },

  getInvitationResponse(invitation) {
    var {response} = invitation;
    if (this.getUserId()  == response.from.id) {

      var audio = document.getElementById('audio-player');
      audio.src="/sounds/Notification.mp3";
      audio.play();

      return {
        type: 'info',
        header: '',
        message: `User ${response.to.name} has ${response.accepted ? 'accepted' : 'rejected'} your invitation.`
      }
    }
    return null;
  }
});

module.exports = GameEventsStore;
