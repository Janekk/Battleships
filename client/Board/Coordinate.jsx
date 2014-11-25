var React = require('react/addons');
var _ = require('lodash');

var Coordinate = React.createClass({
  render: function () {
    var rectProps = {
      width: 10,
      height: 10,
      x: this.props.x * 10,
      y: this.props.y * 10
    };
    return (
      <g className="coord">
        <rect {...rectProps} />
        <text x={rectProps.x + 3} y={rectProps.y + 8} >{this.props.text}</text>
      </g>
    )
  }
});

module.exports = Coordinate;