var React = require('react/addons');
var _ = require('lodash');

var Cell = React.createClass({

  render() {
    var {props} = this;
    var rectProps = {
      className: 'cell',
      width: 10,
      height: 10,
      x: props.x * 10,
      y: props.y * 10
    };

    if (props.shot) {
      var shot = props.shot;
      var cx = React.addons.classSet;
      var classes = cx({
        'cell': true,
        'shot': !!shot,
        'update': props.update,
        'adjacent': (shot && shot.isAdjacentToShip)
      });

      return (
        <g className={classes}>
          <rect {...rectProps} />//
          <g>
            <line x1={rectProps.x} y1={rectProps.y} x2={rectProps.x + rectProps.width} y2={rectProps.y + rectProps.height} />
            <line x1={rectProps.x} y1={rectProps.y + rectProps.height} x2={rectProps.x + rectProps.width} y2={rectProps.y} />
          </g>
        </g>);
    }

    return (
      <rect onClick={props.onCellClick} {...rectProps} />
    )
  }
});


var Hit = React.createClass({

  render() {
    var {props} = this;
    var rectProps = {
      width: 10,
      height: 10,
      x: props.x * 10,
      y: props.y * 10
    };

    var cx = React.addons.classSet;
    var classes = cx({
      'hit': true,
      'update': this.props.update
    });

    return (<rect className={classes} onClick={props.onCellClick} {...rectProps} />);
  }
});

module.exports = {Cell, Hit};