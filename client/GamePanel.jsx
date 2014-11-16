var React = require('react');
var GameBoardSvg = require('./GameBoardSvg.jsx');
var ShipsPanel = require('./ShipsPanel.jsx');
var gameParams = require('./helpers/gameParams');

var _ = require('lodash');

var GamePanel = React.createClass({

  render: function () {
    return (
      <div className="panel pure-g">
        <div className="board pure-u-4-5">
          <GameBoardSvg name='Rene' xsize={gameParams.tableSize} ysize={gameParams.tableSize} />
        </div>
        <div className="ships-panel pure-u-1-5">
          <ShipsPanel />
        </div>
      </div>
    );
  }
});
module.exports = GamePanel;
