var React = require('react/addons');
var _ = require('lodash');

var Cell = React.createClass({

  getInitialState: function () {
    return {selected: false};
  },

  render: function () {
    var rectProps = {
      className: 'cell',
      width: 10,
      height: 10,
      x: this.props.x * 10,
      y: this.props.y * 10
    };

    if(this.props.shot) {
      var shot = this.props.shot;
      var cx = React.addons.classSet;
      var classes = cx({
        'cell': true,
        'shot': shot,
        'hit': (shot && shot.hit),
        'destroyed': (shot && shot.destroyed)
      });

      return(<g className={classes}>
        <rect onClick={this.props.onCellClick} {...rectProps} />
        <line x1={rectProps.x} y1={rectProps.y} x2={rectProps.x + rectProps.width} y2={rectProps.y + rectProps.height} />
        <line x1={rectProps.x} y1={rectProps.y + rectProps.height} x2={rectProps.x + rectProps.width} y2={rectProps.y} />
      </g>);
    }

    return (
      <rect onClick={this.props.onCellClick} {...rectProps} />
    )

  }
});

module.exports = Cell;