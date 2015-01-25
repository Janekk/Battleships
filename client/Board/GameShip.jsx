var React = require('react/addons');
var _ = require('lodash');

var Ship = React.createClass({
  render() {
    var {props} = this, cx = React.addons.classSet;

    var cells = [];
    props.ship.cells.forEach((cell) => {
      var rectProps = {
        width: 10,
        height: 10,
        x: cell.x * 10,
        y: cell.y * 10,
        key: cell.x + '.' + cell.y + '',
        className: cx({'hit': cell.isHit})
      }
      cells.push(<rect {...rectProps}/>);
    });

    var classes = cx({
      'ship': true,
      'destroyed': props.isDestroyed,
      'update': props.update
    });

    return (
      <g className={classes} onClick={props.onShipClick}>
        {cells}
      </g>
    )
  }
});
module.exports = Ship;