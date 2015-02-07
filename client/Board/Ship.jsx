var React = require('react/addons')
  , _ = require('lodash')
  , utils = require('../utils');

var Ship = React.createClass({

  componentDidMount() {
    utils.addDoubleTapEvent(this.getDOMNode());
  },

  render() {
    var cells = [];
    this.props.ship.cells.forEach((cell) => {
      var rectProps = {
        width: 10,
        height: 10,
        x: cell.x * 10,
        y: cell.y * 10,
        key: cell.x + '.' + cell.y + ''
      }
      cells.push(<rect {...rectProps}/>);
    });

    var cx = React.addons.classSet;
    var classes = cx({
      'ship': true,
      'selected': this.props.selected,
      'update': this.props.update
    });

    return (
      <g className={classes} onClick={this.props.onShipClick} onDoubleClick={this.props.onShipDoubleClick} >
        {cells}
      </g>
    )
  }
});

module.exports = Ship;