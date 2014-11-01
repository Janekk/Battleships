module.exports = function(http) {
    var io = require('socket.io')(http);
    var _ = require('lodash');

    io.on('connection', function(socket) {
        var roomJoined = false;

        console.log('a user connected');

        socket.on('join room', function(roomID) {
            console.log('join room', roomID);

            var sockets = getSocketsOfRoom(roomID);
            if (sockets.length >= 2) {
                return socket.emit('room joined', { isSuccessful: false, error: 'There are too many users in this room!' });
            }

            socket.roomID = roomID;
            socket.join(roomID);

            if (sockets.length == 0) { // no opponent at the moment
                socket.emit('room joined', {
                    isSuccessful: true,
                    message: 'waiting for other player...'
                });
            }
            else { // has opponent
                var opponent = _.find(sockets, function(s) {
                    return s.id !== socket.id;
                });

                // announce opponent
                socket.opponent = opponent;
                opponent.opponent = socket;

                socket.emit('room joined', {
                    isSuccessful: true
                });

                socket.opponent.emit('opponent joined');

                setTimeout(function() {
                    io.sockets.in(socket.roomID).emit('game started', {});
                }, 5000);
            }

            roomJoined = true;
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');

            if (socket.opponent) { // has opponent
                socket.opponent.emit('player left');
                socket.opponent.opponent = undefined;
            }

            if (roomJoined) {
                socket.leave(socket.roomID);
            }
        });
    });

    function getSocketsOfRoom(roomID, namespace) {
        var ns = io.of(namespace || '/');

        if (!roomID || !ns) {
            return [];
        }

        return _.filter(ns.connected, function(socket) {
            return _.contains(socket.rooms, roomID);
        });
    }

    return io;
};