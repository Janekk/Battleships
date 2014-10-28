var React = require('react');
var GamePanel = require('./GamePanel.jsx');

var activator = {
  activate: function () {

    var gameData = {
      myBoard: {
        name: 'Rene',
        xsize: 15,
        ysize: 15,
        ships: [
          {name: "red", coordinates: [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}]},
          {name: "red", coordinates: [{x: 5, y: 7}, {x: 6, y: 7}]},
          {name: "red", coordinates: [{x: 7, y: 0}, {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}]}
        ]
      },

      oppBoard: {
        name: 'Janusz',
        xsize: 15,
        ysize: 15,
        ships: [
          {name: "red", coordinates: [{x: 1, y: 2}, {x: 1, y: 3}]},
          {name: "red", coordinates: [{x: 5, y: 7}, {x: 6, y: 7}]},
          {name: "red", coordinates: [{x: 7, y: 0}, {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}]}
        ]
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      var GamePanelFactory = React.createFactory(GamePanel);
      React.render(GamePanelFactory(gameData), document.getElementById('gameboard'));
    });
  }
}

module.exports = activator;