var React = require('react/addons');
var _ = require('lodash');

var cellSize = 40;

var GameBoardSvg = React.createClass({
  getInitialState: function () {
    return {ships: this.props.ships};
  },

  handleCellClick: function (cell) {
    if(cell.ship) {
      var ship = _.find(this.state.ships, function(s) {
        return s == cell.ship;
      });
      if(ship) {
        ship.selected = !ship.selected;
        this.setState({ships: this.state.ships});
      }
    }
  },

  findShip: function (x, y) {
    return _.find(this.state.ships, function (ship) {
      return _.find(ship.coordinates, function (coord) {
        return (coord.x == x && coord.y == y);
      });
    });
  },

  render: function () {
    var cells = [];
    _.times(this.props.xsize, function (x) {
      _.times(this.props.ysize, function (y) {
        var ship = this.findShip(x, y);
        var cellProps = {
          ship: ship,
          key: x + ' ' + y,
          x: x,
          y: y,
          onCellClick: this.handleCellClick.bind(this, {x: x, y: y, ship: ship})
        }
        cells.push(<Cell {...cellProps}/>);
      }.bind(this));
    }.bind(this));


    return (
      <div>
        <p>{"Table name: " + this.props.name}</p>
        <div className="gameboard-table">
          <svg width="600" height="600">
            {cells}
          </svg>
        </div>
      </div>
    );
  }
});

var Cell = React.createClass({

  getInitialState : function() {
    return {selected: false};
  },

  render: function () {
    var cx = React.addons.classSet;
    var classes = cx({
      'cell': true,
      'ship': this.props.ship,
      'selected': ((this.props.ship && this.props.ship.selected) ? " " + "selected" : "")
    });

    var rectProps = {
      className: classes,
      id: this.props.x + '' + this.props.y + '',
      text: this.props.x + '|' + this.props.y + '|',
      width: cellSize,
      height: cellSize,
      x: this.props.x*cellSize,
      y: this.props.y*cellSize
    }

    return (
      <rect {...rectProps} onClick={this.props.onCellClick}>
        <text>{rectProps.text}</text>
      </rect>)
  }
})


module.exports = GameBoardSvg;