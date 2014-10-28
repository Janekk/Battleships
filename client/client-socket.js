module.exports = function() {
    var socket = io();

    $(document).ready(function() {
        var $messages = $('#messages');
        var $roomID = $('#room-id');
        var $registerRoom = $('#register-room');
        var $sendMessage = $('#send-message');
        var $message = $('#message');

        $registerRoom.on('click', function(e) {
            // disable buttons
            $roomID.prop('disabled', true);
            $registerRoom.prop('disabled', true);

            socket.emit('register room', $roomID.val());
        });

        $sendMessage.on('click', function(e) {
            socket.emit('chat message', $message.val());
            $message.val('');
        });
    });

    socket.on('room registered', function(result) {
        var $messages = $('#messages');

        if (result.isSuccessful) {
            $messages.append($('<li>')
                .addClass('info')
                .text('room registration: successful'));

            // activate message field
            $('#message').prop('disabled', false);
            $('#send-message').prop('disabled', false);
        }
        else { // error
            $messages.append($('<li>')
                .addClass('error')
                .text(result.error));

            // activate buttons
            $('#room-id').prop('disabled', false);
            $('#register-room').prop('disabled', false);
        }
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>')
            .addClass('chat')
            .text(msg));
    });
};