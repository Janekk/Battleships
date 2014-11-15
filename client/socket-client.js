module.exports = function() {
    var socket = io();

    $(document).ready(function() {
        var $roomID = $('#room-id');
        var $joinButton = $('#join-button');
        var $placeShipsButton = $('#place-ships-button');

        $joinButton.on('click', function() {
            // disable buttons
            $roomID.prop('disabled', true);
            $joinButton.prop('disabled', true);

            socket.emit('join room', $roomID.val());
        });

        $placeShipsButton.on('click', function() {
            socket.emit('place ships', [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0}], [{ x: 1, y: 2 }, { x: 2, y: 2 }]]);
        });
    });

    socket.on('room joined', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);

            // activate buttons
            $('#room-id').prop('disabled', false);
            $('#join-button').prop('disabled', false);

            return;
        }

        var message = 'room joined';

        if (result.message) {
            message += '<br/>' + result.message;
        }

        toastr.info(message);
    });

    socket.on('game started', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);
            return;
        }

        toastr.info('game started');
        //TODO show gameboard and user can position ships
    });

    socket.on('ships placed', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);
            return;
        }

        toastr.info(result.message);
    });

    socket.on('player left', function() {
        toastr.warning('player has left :-(');

        //TODO cancel game
    });

    socket.on('message', function(message) {
        toastr.info(message);
    });

    socket.on('error', function(message) {
        toastr.error(message);
    });
};