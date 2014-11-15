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
        if (result.isSuccessful) {
            var message = 'room joined';

            if (result.message) {
                message += '<br/>' + result.message;
            }

            toastr.info(message);
        }
        else { // error
            toastr.error(result.error);

            // activate buttons
            $('#room-id').prop('disabled', false);
            $('#join-button').prop('disabled', false);
        }
    });

    socket.on('player joined', function() {
        toastr.info('player joined');
    });

    socket.on('game started', function(result) {
        if (result.isSuccessful === true) {
            toastr.info('game started');

            //TODO show gameboard and user can position ships
        }
        else {
            toastr.error(result.error);
        }
    });

    socket.on('ships placed', function(result) {
        if (result.isSuccessful === true) {
            toastr.info('ships are placed<br/>Waiting for player...');
        }
        else {
            toastr.error(result.error);
        }
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