var React = require('react/addons');
var _ = require('lodash');

var Ship = React.createClass({
  render: function () {
    var cx = React.addons.classSet;

    var cells = [];
    this.props.ship.cells.forEach(function (cell) {
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
      'destroyed': this.props.isDestroyed
    });

    return (
      <g className={classes} onClick={this.props.onShipClick}>
        {cells}
      </g>
    )
  }
});
module.exports = Ship;