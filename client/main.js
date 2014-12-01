var React = require('react')
  , Game = require('./Game')
  , Actions = require('./actions');

var gameData = {
  boardSize: 10,
  configShips: [
      {name: 'Battleship', size: 4, count: 1}/*,
      {name: 'Submarine', size: 3, count: 1},
      {name: 'Cruiser', size: 2, count: 2},
      {name: 'Destroyer', size: 1, count: 2}*/
    ]
};

document.addEventListener('DOMContentLoaded', function () {
  React.render(<Game />, document.getElementById('game'));

  Actions.init.setConfig(gameData);
  Actions.init.startGame();
});
