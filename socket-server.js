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

            var result = { isSuccessful: true };

            if (sockets.length == 0) {
                result.message = 'waiting for other player...'
            }

            socket.emit('room joined', result);
            roomJoined = true;
        });

        /*
        socket.on('chat message', function(message){
            if (!socket.roomID) {
                return;
            }

            io.to(socket.roomID).emit('chat message', message);
        });
        */

        socket.on('disconnect', function(){
            console.log('user disconnected');

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