var socket = io();

$(document).ready(function() {
    $('#message').on('keyup', function(e) {
        if (e.keyCode == 13) {
            var $this = $(this);
            socket.emit('chat message', $this.val());
            $this.val('');
        }
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
});