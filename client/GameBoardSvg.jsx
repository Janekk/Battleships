var React = require('react/addons');
var _ = require('lodash');

var cellSize = 40;

var GameBoardSvg = React.createClass({
  getInitialState: function () {
    return {
      selection: undefined
    };
  },

  handleBoardShipClick: function (ship) {
    if (ship) {
      var ship = _.find(this.props.ships, function (s) {
        return s == ship;
      });
      if (ship) {
        this.setState({selection: ship});
      }
    }
  },

  onDragOver: function (ev) {
    ev.preventDefault();
  },

  onDrop: function (ev) {
    ev.preventDefault();
    var confShip = JSON.parse(ev.dataTransfer.getData("text"));

    var cells = this.getDroppedShip(this.getCell(ev), confShip);
    var ship = {
      name: 'red',
      cells: cells
    }

    this.props.handleShipDrop(ship);
  },

  getDroppedShip: function (cell, ship) {
    var result = [];
    for (var i = 0; i < ship.size; i++) {
      result.push({x: cell.x + i, y: cell.y});
    }
    return result;
  },

  getCell: function(event) {
    return {
      x: Math.floor((event.pageX - event.currentTarget.offsetLeft) / cellSize),
      y: Math.floor((event.pageY - event.currentTarget.offsetTop) / cellSize)
    };
  },

  handleClick: function(ev) {
    this.props.handleClick(this.getCell(ev), this.getDroppedShip);
  },

  render: function () {
    var cells = [];
    _.times(this.props.xsize, function (x) {
      _.times(this.props.ysize, function (y) {
        var cellProps = {
          key: x + ' ' + y,
          x: x,
          y: y
        }
        cells.push(<Cell {...cellProps}/>);
      }.bind(this));
    }.bind(this));

    var ships = []
    this.props.ships.forEach(function (ship, index) {
      ships.push(<Ship key={index} ship={ship} selected={this.selection==ship} onShipClick={this.handleBoardShipClick.bind(this, ship)}/>)
    }.bind(this));

    return (
      <div>
        <p>{"Table name: " + this.props.name}</p>
        <div className="gameboard-table" onDragOver={this.onDragOver} onDrop={this.onDrop} onClick={this.handleClick}>
          <svg width="600" height="600">
            {cells}
            {ships}
          </svg>
        </div>
      </div>
    );
  }
});

var Cell = React.createClass({

  getInitialState: function () {
    return {selected: false};
  },

  render: function () {
    var rectProps = {
      className: 'cell',
      key: this.props.x + '.' + this.props.y + '',
      width: cellSize,
      height: cellSize,
      x: this.props.x * cellSize,
      y: this.props.y * cellSize
    }

    return (
      <rect {...rectProps} />)
  }
});

var Ship = React.createClass({
  render: function () {
    var cells = [];
    this.props.ship.cells.forEach(function (cell) {
      var rectProps = {
        width: cellSize,
        height: cellSize,
        x: cell.x * cellSize,
        y: cell.y * cellSize,
        key: cell.x + '.' + cell.y + '',
      }
      cells.push(<rect {...rectProps}/>);
    });

    var cx = React.addons.classSet;
    var classes = cx({
      'ship': true,
      'selected': this.props.selected
    });

    return (
      <g className={classes} onClick={this.props.onShipClick}>
        {cells}
      </g>
    )
  }
});


module.exports = GameBoardSvg;