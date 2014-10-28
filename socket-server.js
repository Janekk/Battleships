module.exports = function(http) {
    var io = require('socket.io')(http);
    var _ = require('lodash');

    io.on('connection', function(socket){
        var roomJoined = false;

        console.log('a user connected');

        socket.on('register room', function(roomID) {
            console.log('join room', roomID);

            var sockets = getSocketsOfRoom(roomID);
            if (sockets.length > 1) {
                return socket.emit('room registered', { isSuccessful: false, error: 'There are too many users in this room!' });
            }

            socket.roomID = roomID;
            socket.join(roomID);
            socket.emit('room registered', { isSuccessful: true });

            roomJoined = true;
        });

        socket.on('chat message', function(message){
            if (!socket.roomID) {
                return;
            }

            io.to(socket.roomID).emit('chat message', message);
        });

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