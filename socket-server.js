module.exports = function(http) {
    var io = require('socket.io')(http);
    var _ = require('lodash');
    var messageHelper = require('./helper/message');
    var GameService = require('./models/gameService');

    io.on('connection', function(socket) {
        socket.invaders = []; // contains socket-IDs from users who invited this player
        //socket.gameService = new GameService(socket);

        socket.on('enter lobby', function(username) {
            if (socket.username) { // user is already in lobby
                socket.emit('enter lobby error', 'You are already in the lobby.');
                return;
            }

            var users = getUsersOfLobby('lobby');
            var user = _.find(users, { username: username });
            if (user) { // username already exists
                socket.emit('enter lobby error', 'The username already exists.');
                return;
            }

            // join lobby
            socket.username = username;
            socket.join('lobby');
            socket.broadcast.to('lobby').emit('lobby update', { users: getUsersOfLobby('lobby') });
        });

        /*
        socket.on('change username', function(username) {
            if (socket.username !== undefined) {
                socket.username = username;
                socket.broadcast.to('lobby').emit('lobby update', { users: getUsersOfLobby('lobby') });
            }
        });
        */

        socket.on('invite user', function(userID) {
            if (!socket.username) { // user isn't in lobby
                socket.emit('user invited', messageHelper.toResult(new Error('You are not in the lobby.')));
                return;
            }

            if (socket.id === userID) { // self invitation
                socket.emit('user invited', messageHelper.toResult(new Error('You can\'t invite yourself!')));
                return;
            }

            var users = getUsersOfLobby('lobby');
            var user = _.find(users, { id: userID });
            if (!user) {
                socket.emit('user invited', messageHelper.toResult(new Error('User not found in lobby!')));
                return;
            }

            var otherSocket = io.sockets.socket(user.id);

            if (_.contains(otherSocket.invaders, socket.id)) { // already invited
                socket.emit('user invited', messageHelper.toResult(new Error('The user has already an invitation from you.')));
                return;
            }

            // invite player
            otherSocket.invaders.push(socket.id);
            otherSocket.emit('invitation', { id: socket.id, username: socket.username });

            socket.emit('user invited', messageHelper.toResult());
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
            if (socket.username) {
                // leave lobby
                socket.leave('lobby');
                socket.broadcast.to('lobby').emit('lobby update', { users: getUsersOfLobby('lobby') });
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