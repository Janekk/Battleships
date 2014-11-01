var React = require('react');
var GameBoardSvg = require('./GameBoardSvg.jsx');

var _ = require('lodash');

var GamePanel = React.createClass({
  render: function () {
    return (
      <div className="panel">
        {React.createElement(GameBoardSvg, this.props.myBoard)}
        {React.createElement(GameBoardSvg, this.props.oppBoard)}
      </div>
    );
  }
});

module.exports = GamePanel;