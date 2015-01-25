var io = require('socket.io-client');
var gameEvents = require('../../game/gameEvents');
var utils = require('./serverTestUtils');
var _ = require('lodash');

var http;

var getServer = function (http) {
  return require('../../game/socket-server')(http);
};

describe('Lobby service', function () {
  var server, invitedClient;

  beforeEach(function () {
    if (!this.server) {
      http = require('http').Server().listen(3000);
      this.server = utils.getServer(http);
    }
    if (invitedClient) {
      invitedClient.disconnect();
    }
    invitedClient = utils.getClient();
  });

  afterEach(function () {
    if (http) {
      http.close();
    }
  });

  jasmine.getEnv().defaultTimeoutInterval = 5000;
  it('allows to enter lobby', function (done) {

    expect(invitedClient).toBeTruthy();

    invitedClient.on(gameEvents.server.lobbyUpdate, function (users) {
      expect(users).not.toBeNull();
      done();
    });
    invitedClient.emit(gameEvents.client.enterLobby, 'test user');
  });

  it('returns own user data on lobby enter', function (done) {

    expect(invitedClient).toBeTruthy();

    invitedClient.on(gameEvents.server.enterLobbyStatus, function (result) {
      expect(result.user.id).toBe('test user');
      done();
    });
    invitedClient.emit(gameEvents.client.enterLobby, 'test user');
  });

  it('allows to use the same name after previous user was disconnected', function (done) {
    var username = 'test user';
    invitedClient.emit(gameEvents.client.enterLobby, username);

    invitedClient.disconnect();
    invitedClient = require('socket.io-client')('http://localhost:3000', {
      forceNew: true
    });

    invitedClient.on(gameEvents.server.lobbyUpdate, function (result) {
      expect(result.newUser.id).toBe(username);
      expect(result.users.length).toEqual(1);
      done();
    });

    invitedClient.emit(gameEvents.client.enterLobby, username);
  });
  //it('doesn\'t allow to enter lobby with the same name more than once', function (done) {
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
  //it('doesn\'t allow to enter lobby with null name', function (done) {
  //  waitForEnterLobbyError(done);
  //  client.emit(gameEvents.client.enterLobby, null);
  //});
  //
  //it('doesn\'t allow to enter lobby with empty name', function (done) {
  //  waitForEnterLobbyError(done);
  //  client.emit(gameEvents.client.enterLobby, '');
  //});
  //
  //it('doesn\'t allow to enter lobby with undefined name', function (done) {
  //  waitForEnterLobbyError(done);
  //  client.emit(gameEvents.client.enterLobby);
  //});
  //
  //it('doesn\'t allow to invite by unsigned user', function (done) {
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
  //it('doesn\'t allow to invite non-existing user', function (done) {
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
  it('allows to invite a user', function (done) {
    var lobbyUsers, inviteId = 'test', otherId = 'other';
    var gotStatus, gotFwd;
    var checkComplete = function(done) {
      if (gotStatus && gotFwd) {
        done();
      }
    };

    invitedClient.emit(gameEvents.client.enterLobby, inviteId);
    invitedClient.on(gameEvents.server.lobbyUpdate, function (result) {
      lobbyUsers = result.users;

      var otherClient = utils.getClient();
      otherClient.on(gameEvents.server.lobbyUpdate, function (result) {
        otherClient.on(gameEvents.server.invitationRequestStatus, function (result) {
          expect(result.isSuccessful).toBe(true);
        });

        otherClient.on(gameEvents.server.invitationResponse, function (result) {
          gotFwd = true;
          expect(result.accepted).toBe(true);

          checkComplete(done);
        });

        invitedClient.on(gameEvents.server.invitationForward, function(result) {
          expect(result.invitation.from).toBe(otherId);
          expect(result.invitation.to).toBe(inviteId);

          invitedClient.on(gameEvents.server.invitationResponse, function (result) {
            gotStatus = true;
            expect(result.accepted).toBe(true);

            checkComplete(done);
          });
          var invitationResponse = {accepted: true, invitation: result.invitation};
          invitedClient.emit(gameEvents.client.invitationResponse, invitationResponse);
        });
        otherClient.emit(gameEvents.client.invitationRequest, inviteId);
      });
      otherClient.emit(gameEvents.client.enterLobby, otherId);
    });
  });

});