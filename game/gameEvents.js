var gameEvents = {
  client : {
    enterLobby: 'enter lobby',
    invitationRequest: 'invitation request',
    invitationResponse: 'invitation response',
    placeShips: 'place ships',
    shoot: 'shoot',
    quitGame: 'quit game',
    signOut: 'sign out'
  },
  server : {
    enterLobbyStatus: 'enter lobby status',
    lobbyUpdate: 'lobby update',
    invitationRequestStatus: 'invitation request status',
    invitationForward: 'invitation forward',
    invitationResponse: 'invitation response',
    gameStarted: 'game started',
    shipsPlaced: 'ships placed',
    playerSwitched: 'player switched',
    activatePlayer: 'activate player',
    playerLeft: 'player left',
    infoMessage: 'info message',
    shotUpdate: 'shot update',
    gameOver: 'game over',
    quitGameStatus: 'quit game status',
    signOutStatus: 'sign out status'
  }
};

module.exports = gameEvents;

