module.exports = function(http) {
    var io = require('socket.io')(http);
    var GameService = require('./models/gameService');

    io.on('connection', function(socket) {
        socket.gameService = new GameService(socket);

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
            socket.gameService.disconnect();
        });
    });

    return io;
};