module.exports = function() {
    var socket = io();

    $(document).ready(function() {
        var $roomID = $('#room-id');
        var $joinButton = $('#join-button');

        $joinButton.on('click', function(e) {
            // disable buttons
            $roomID.prop('disabled', true);
            $joinButton.prop('disabled', true);

            socket.emit('join room', $roomID.val());
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

    socket.on('opponent joined', function() {
        toastr.info('player joined');
    });

    socket.on('game started', function(result) {
        toastr.info('game started');
    });

    socket.on('player left', function() {
        toastr.warning('player has left :-(');
    });
};