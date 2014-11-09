var React = require('react');
var GamePanel = React.createFactory(require('./GamePanel.jsx'));
var Actions = require('./actions');

var activator = {
  activate: function () {

    var gameData = {
      myBoard: {
        ships: [
          {name: "red", cells: [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}]},
          {name: "red", cells: [{x: 5, y: 7}, {x: 6, y: 7}]},
          {name: "red", cells: [{x: 7, y: 0}, {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}]}
        ]
      },

      configItems: {
        items: [
          {size: 1, count: 2},
          {size: 2, count: 1},
          {size: 3, count: 1},
        ]
      }
    };

    document.addEventListener('DOMContentLoaded', function () {
      React.render(GamePanel(), document.getElementById('gameboard'));
    });

    Actions.init.ships(gameData.myBoard);
    Actions.init.config(gameData.configItems);
  }
}

module.exports = activator;