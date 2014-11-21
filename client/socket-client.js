module.exports = function() {
    var socket = io();

    $(document).ready(function() {
        var $roomID = $('#room-id');
        var $username = $('#username');
        var $joinButton = $('#join-button');
        var $placeShipsButton = $('#place-ships-button');
        var $shootButton = $('#shoot-button');
        var $setUsernameButton = $('#set-username-button');

        $joinButton.on('click', function() {
            // disable buttons
            $roomID.prop('disabled', true);
            $joinButton.prop('disabled', true);

            socket.emit('join room', $roomID.val());
        });

        $placeShipsButton.on('click', function() {
            socket.emit('place ships', [
                [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0}],
                [{ x: 1, y: 2 }, { x: 2, y: 2 }]
            ]);
        });

        $shootButton.on('click', function() {
            socket.emit('shoot', { x: 0, y: 0 });
        });

        $setUsernameButton.on('click', function() {
            socket.emit('enter lobby', $username.val());
        });
    });

    socket.on('user enters lobby', function(data) {
        var $lobby = $('#lobby');
        $lobby.append('<li data-id="' + data.id + '">' + data.username + '</li>');
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

    socket.on('activate player', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);
            return;
        }

        if (result.message) {
            toastr.info(result.message);
        }

        // TODO it's your turn. Let's player shoot.
    });

    socket.on('player switched', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);
            return;
        }

        // TODO disable player. Opponent is playing...
    });

    socket.on('has shot', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);
            return;
        }

        // TODO show result on gameboard
        // result.shipWasHit (boolean)
        // result.shipWasDestroyed (boolean)
        // result.position { x: 0, y: 0 }
    });

    socket.on('game over', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);
            return;
        }

        //result.hasWon (boolean)
    });

    socket.on('player left', function(result) {
        if (!result.isSuccessful) { // error
            toastr.error(result.error);
            return;
        }

        toastr.warning('player has left :-(');

        //TODO cancel game
    });

    socket.on('info-message', function(result) {
        toastr.info(result.message);
    });
};