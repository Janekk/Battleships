var React = require('react');
var GameBoard = require('./GameBoard.jsx');
var _ = require('lodash');

var GamePanel = React.createClass({
  render: function () {
    var dragMethods = {onUserDrop: this.handleUserDrop};
    var myBoardProps = _.extend( this.props.myBoard, dragMethods);
    var oppBoardProps = _.extend( this.props.oppBoard, dragMethods);
    return (
      <div className="panel">
        {React.createElement(GameBoard, myBoardProps)}
        {React.createElement(GameBoard, oppBoardProps)}
      </div>
    );
  }
});

module.exports = GamePanel;