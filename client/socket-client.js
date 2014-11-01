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
            if (result.message) {
                toastr.info(result.message);
            }
        }
        else { // error
            toastr.error(result.error);

            // activate buttons
            $('#room-id').prop('disabled', false);
            $('#join-button').prop('disabled', false);
        }
    });
};