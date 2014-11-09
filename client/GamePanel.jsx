var React = require('react');
var GameBoardSvg = require('./GameBoardSvg.jsx');
var ShipsPanel = require('./ShipsPanel.jsx');
var Actions = require('./actions');

var _ = require('lodash');

var GamePanel = React.createClass({

  render: function () {
    return (
      <div className="panel">
        <div className="board">
          <GameBoardSvg name='Rene' xsize={15} ysize={15} />
        </div>
      <ShipsPanel />
      </div>
    );
  }
});


module.exports = GamePanel;
