var React = require('react/addons');
var _ = require('lodash');

var Cell = React.createClass({

  getInitialState: function () {
    return {selected: false};
  },

  render: function () {
    var rectProps = {
      className: 'cell',
      key: this.props.x + '.' + this.props.y + '',
      width: 10,
      height: 10,
      x: this.props.x * 10,
      y: this.props.y * 10
    };

    var shot;
    if(this.props.shot) {

      return(<g>
        <rect onClick={this.props.onCellClick} {...rectProps} />
        <line x1={rectProps.x} y1={rectProps.y} x2={rectProps.x + rectProps.width} y2={rectProps.y + rectProps.height} style={{stroke:'red'}} />
        <line x1={rectProps.x} y1={rectProps.y + rectProps.height} x2={rectProps.x + rectProps.width} y2={rectProps.y} style={{stroke:'red'}} />
      </g>);
    }

    return (
      <rect onClick={this.props.onCellClick} {...rectProps} />
    )

  }
});

module.exports = Cell;