var io = require('socket.io-client');
var gameEvents = require('../game/gameEvents');
var utils = require('./serverTestUtils');
var http;

describe('socket-server', function () {
  var server, client;

  beforeEach(function () {
    if(!this.server) {
      http = require('http').Server().listen(3000);
      this.server = utils.getServer(http);
    }
    if (client) {
      client.disconnect();
    }
    client = utils.getClient();
  });

  afterEach(function() {
    if(http) {
      http.close();
    }
  });

  jasmine.getEnv().defaultTimeoutInterval = 5000;
  it('doesn\'t allow to place ships by unsigned user', function (done) {

    client.on(gameEvents.server.shipsPlaced, function (result) {
      expect(result.isSuccessful).toBe(false);
      done();
    });

    client.emit(gameEvents.client.placeShips, []);
  });

  it('doesn\'t allow to shoot by unsigned user', function (done) {

    client.on(gameEvents.server.shotUpdate, function (result) {
      expect(result.isSuccessful).toBe(false);
      done();
    });

    client.emit(gameEvents.client.shoot, []);
  });

  it('doesn\'t allow to place ships before game start', function (done) {

    client.on(gameEvents.server.shipsPlaced, function (result) {
      expect(result.isSuccessful).toBe(false);
      done();
    });

    client.emit(gameEvents.client.enterLobby, 'test user');
    client.emit(gameEvents.client.placeShips, []);
  });

});