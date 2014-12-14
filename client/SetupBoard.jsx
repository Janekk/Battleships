var React = require('react/addons')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , ShipPopup = require('./SetupBoardPopup')
  , Cell = require('./Board/Cell.jsx')
  , Coordinate = require('./Board/Coordinate')
  , Ship = require('./Board/Ship.jsx')
  , SetupStore = require('./stores/SetupStore');

var SetupBoard = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function () {
    return {
      ships: [],
      selected: null
    };
  },

  componentDidMount: function () {
    this.listenTo(SetupStore, this.loadGameBoard);
  },

  loadGameBoard: function (data) {
    var state = {};
    if (data.ships) {
      state.ships = data.ships;
    }
    if ('selected' in data && data.selected) {
      if (data.selected.type == 'board') {
        state.selected = data.selected.item;
      }
      else {
        state.selected = null;
      }
    }
    this.setState(state);
  },

  handleShipClick: function (ship, event) {
    event.stopPropagation();
    Actions.setup.selectShip(ship);
  },

  handleCellClick: function (cellProps) {
    var cell = {x: cellProps.x, y: cellProps.y};
    Actions.setup.selectCell(cell, this.state.ships);
  },

  render: function () {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var coords = [];
    _.times(this.props.xsize, function (x) {
      var y = -1;
      coords.push(<Coordinate x={x} y={y} key={x + '' + y} text={alphabet[x]}/>);
    });
    _.times(this.props.ysize, function (y) {
      var x = -1;
      coords.push(<Coordinate x={x} y={y} key={x + '' + y} text={y + ''}/>);
    });

    var cells = [];
    _.times(this.props.xsize, function (x) {
      _.times(this.props.ysize, function (y) {
        var cellProps = {
          key: x + ' ' + y,
          x: x,
          y: y
        };
        cells.push(<Cell {...cellProps} onCellClick={this.handleCellClick.bind(this, cellProps)}/>);
      }.bind(this));
    }.bind(this));

    var ships = [];
    this.state.ships.forEach(function (ship, index) {
      ships.push(<Ship key={index} ship={ship} selected={this.state.selected == ship} onShipClick={this.handleShipClick.bind(this, ship)}/>)
    }.bind(this));

    var viewBox = [-10, -10, (this.props.xsize + 1) * 10, (this.props.ysize + 1) * 10];

    return (
      <div className="setup-board">
          {this.state.selected ? <ShipPopup /> : null}
        <svg width="100%" height="100%" viewBox={viewBox.join(' ')}>
            {coords}
            {cells}
            {ships}
        </svg>
      </div>
    );
  }
});

module.exports = SetupBoard;