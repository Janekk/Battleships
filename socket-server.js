module.exports = function(http) {
    var io = require('socket.io')(http);
    var _ = require('lodash');
    var GameService = require('./models/gameService');

    io.on('connection', function(socket) {
        //socket.gameService = new GameService(socket);

        socket.on('enter lobby', function(username) {
            if (socket.username === undefined) { // user isn't in lobby
                socket.username = username;

                var users = getUsersOfLobby('lobby');

                // enter lobby
                socket.join('lobby');
                socket.emit('has entered lobby', { isSuccessful: true, users: users });
                socket.broadcast.to('lobby').emit('user enters lobby', { id: socket.id, username: username });
            }
        });

        socket.on('change username', function(username) {
            if (socket.username !== undefined) {
                socket.username = username;
                socket.broadcast.to('lobby').emit('username changed', { id: socket.id, username: username });
            }
        });

        socket.on('join room', function(roomID) {
            socket.gameService.joinRoom(roomID);
        });

        socket.on('place ships', function(shipsData) {
            socket.gameService.placeShips(shipsData);
        });

        socket.on('shoot', function(position) {
            socket.gameService.shoot(position);
        });

        socket.on('disconnect', function(){
            if (socket.username !== undefined) {
                // leave lobby
                socket.leave('lobby');

                socket.broadcast.to('lobby').emit('user left lobby', { id: socket.id, username: socket.username });
            }

            if (socket.gameService) {
                socket.gameService.disconnect();
            }
        });
    });

    function getUsersOfLobby() {
        var ns = io.of('/');

        return _.chain(ns.connected)
            .filter(function(socket) {
                return socket.username && _.contains(socket.rooms, 'lobby');
            })
            .map(function(socket) {
                return { id: socket.id, username: socket.username };
            })
            .value();
    }

    return io;
};