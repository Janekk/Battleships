var React = require('react')
  , Game = require('./Game')
  , Actions = require('./actions');

var gameData = {
  boardSize: 10,
  configShips: [
      {size: 1, count: 2},
      {size: 2, count: 1},
      {size: 3, count: 1}
    ]
};

document.addEventListener('DOMContentLoaded', function () {
  React.render(<Game />, document.getElementById('gameboard'));

  Actions.init.setConfig(gameData);
  Actions.init.startGame();
});
