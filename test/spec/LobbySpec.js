var LobbyService = require('../../game/LobbyService');
var customMatchers = require('../customMatchers');
var _ = require('lodash');

describe('Lobby', function () {

  var Lobby;
  beforeEach(function () {
    this.addMatchers(customMatchers);
    Lobby = LobbyService();
  });

  it('allows to enter lobby', function () {

    var username = 'test';
    var result = Lobby.enterLobby(username);

    expect(result.isSuccessful).toBeTruthy();
    expect(result.user.id).toEqual(username);
    var users = Lobby.getLobbyState().users;
    expect(users.length).toBe(1);
    expect(users).toContainWhere({id: username})
  });

  it('doesn\'t allow to enter lobby with the same name twice', function () {

    var username = 'test';
    var result = Lobby.enterLobby(username);
    var result = Lobby.enterLobby(username);

    expect(result.isSuccessful).toBeFalsy();
    expect(result.error).toBe('The username already exists.');
  });

  it('allows to leave lobby', function () {
    var username = 'test';
    var result = Lobby.enterLobby(username);
    var result = Lobby.leaveLobby(username);

    expect(result.isSuccessful).toBeTruthy();
    var users = Lobby.getLobbyState().users;
    expect(users.length).toBe(0);
  });

  it('doesn\'t allow to leave by an unregistered user', function () {
    var username = 'test';
    var result = Lobby.leaveLobby(username);

    expect(result.isSuccessful).toBeFalsy();
    expect(result.error).toEqual('User with the given ID doesn\'t exist.');
  });

  it('allows to invite a user', function () {
    var username = 'test';
    Lobby.enterLobby(username);

    var inviting = 'inviting';
    Lobby.enterLobby(inviting);

    var result = Lobby.inviteUser(username, inviting);
    expect(result.isSuccessful).toBeTruthy();
    expect(result.from).toEqual(inviting);
    expect(result.to).toEqual(username);
  });

  it('doesn\'t allow to invite a unregistered user', function () {
    var username = 'test';

    var inviting = 'inviting';
    Lobby.enterLobby(inviting);

    var result = Lobby.inviteUser(username, inviting);
    expect(result.isSuccessful).toBeFalsy();
    expect(result.error).toBeTruthy();
  });

  it('doesn\'t allow to send an invitation more than once', function () {
    var username = 'test';
    Lobby.enterLobby(username);
    var inviting = 'inviting';
    Lobby.enterLobby(inviting);

    Lobby.inviteUser(username, inviting);
    var result = Lobby.inviteUser(username, inviting);
    expect(result.isSuccessful).toBeFalsy();
    expect(result.error).toEqual('The user has already an invitation from you.');
  });

  it('allows to accept an invitation', function () {
    var username = 'test';
    Lobby.enterLobby(username);

    var inviting = 'inviting';
    Lobby.enterLobby(inviting);

    Lobby.inviteUser(username, inviting);
    var result = Lobby.acceptInvitation(true, username, inviting);
    var users = Lobby.getLobbyState().users;
    expect(_.find(users, {id: inviting}).isPlaying).toBeTruthy();
    expect(_.find(users, {id: username}).isPlaying).toBeTruthy();
  });

  //it('returns own user data on lobby enter', function (done) {
  //
  //  expect(client).toBeTruthy();
  //
  //  client.on(gameEvents.server.enterLobbyStatus, function (user) {
  //    expect(user.userId).toBe('test user');
  //    done();
  //  });
  //  client.emit(gameEvents.client.enterLobby, 'test user');
  //});
  //
  //it('allows to use the same name after previous user was disconnected', function (done) {
  //
  //  client.emit(gameEvents.client.enterLobby, 'test user');
  //
  //  client.disconnect();
  //  client = require('socket.io-client')('http://localhost:3000', {
  //    forceNew: true
  //  });
  //
  //  client.on(gameEvents.server.lobbyUpdate, function (users) {
  //    expect(users).not.toBeNull();
  //    done();
  //  });
  //
  //  client.emit(gameEvents.client.enterLobby, 'test user');
  //});
  //
  //
  //it('disallows to enter lobby with the same name more than once', function (done) {
  //
  //  client.on(gameEvents.server.enterLobbyStatus, function (error) {
  //    expect(error).toMatch('.+');
  //    done();
  //  });
  //
  //  client.emit(gameEvents.client.enterLobby, 'test user');
  //  client.emit(gameEvents.client.enterLobby, 'test user');
  //});
  //
  //var waitForEnterLobbyError = function (done) {
  //  client.on(gameEvents.server.lobbyUpdate, function (users) {
  //    expect(false).toBe(true);
  //    done();
  //  });
  //
  //  client.on(gameEvents.server.enterLobbyStatus, function (error) {
  //    expect(error).toMatch('.+');
  //    done();
  //  });
  //};
  //
  //it('disallows to enter lobby with null name', function (done) {
  //  waitForEnterLobbyError(done);
  //  client.emit(gameEvents.client.enterLobby, null);
  //});
  //
  //it('disallows to enter lobby with empty name', function (done) {
  //  waitForEnterLobbyError(done);
  //  client.emit(gameEvents.client.enterLobby, '');
  //});
  //
  //it('disallows to enter lobby with undefined name', function (done) {
  //  waitForEnterLobbyError(done);
  //  client.emit(gameEvents.client.enterLobby);
  //});
  //
  //it('disallows to invite by unsigned user', function (done) {
  //  client.emit(gameEvents.client.enterLobby, 'test');
  //  var lobbyUsers;
  //  client.on(gameEvents.server.lobbyUpdate, function (users) {
  //    lobbyUsers = users;
  //    var otherClient = utils.getClient();
  //    otherClient.on(gameEvents.server.invitationRequestStatus, function (result) {
  //      expect(result.isSuccessful).toBe(false);
  //      done();
  //    });
  //    var inviteId = _.find(lobbyUsers.users, {username: 'test'}).id;
  //    otherClient.emit(gameEvents.client.invitationRequest, inviteId);
  //  });
  //});
  //
  //it('disallows to invite non-existing user', function (done) {
  //  client.emit(gameEvents.client.enterLobby, 'test');
  //
  //  client.on(gameEvents.server.invitationRequestStatus, function (result) {
  //    expect(result.isSuccessful).toBe(false);
  //    done();
  //  });
  //
  //  client.emit(gameEvents.client.invitationRequest, 'non existing');
  //});
  //
  //it('allows to invite a user', function (done) {
  //  var lobbyUsers;
  //  client.emit(gameEvents.client.enterLobby, 'test');
  //  client.on(gameEvents.server.lobbyUpdate, function (users) {
  //    lobbyUsers = users;
  //
  //    var otherClient = utils.getClient();
  //    otherClient.emit(gameEvents.client.enterLobby, 'other');
  //    otherClient.on(gameEvents.server.lobbyUpdate, function (users) {
  //      otherClient.on(gameEvents.server.invitationRequestStatus, function (result) {
  //        expect(result.isSuccessful).toBe(true);
  //        console.dir(result);
  //        done();
  //      });
  //      var inviteId = _.find(lobbyUsers.users, {username: 'test'}).id;
  //      otherClient.emit(gameEvents.client.invitationRequest, inviteId);
  //    })
  //  });
  //});

});