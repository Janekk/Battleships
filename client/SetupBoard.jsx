var React = require('react/addons')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions')
  , Cell = require('./Board/Cell.jsx')
  , Coordinate = require('./Board/Coordinate')
  , Ship = require('./Board/Ship.jsx')
  , SetupStore = require('./stores/SetupStore');

var SetupBoard = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {
      ships: [],
      selected: null
    };
  },

  componentDidMount() {
    this.listenTo(SetupStore, this.loadGameBoard);
  },

  loadGameBoard(data) {
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

  handleShipClick(ship, event) {
    event.stopPropagation();
    Actions.setup.selectShip(ship);
  },

  pivotShip(ship, event) {
    event.stopPropagation();
    Actions.setup.selectShip(ship);
    Actions.setup.pivotShip();
  },

  handleCellClick(cellProps) {
    var cell = {x: cellProps.x, y: cellProps.y};
    Actions.setup.selectCell(cell, this.state.ships);
  },

  render() {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var coords = [];
    for(var x = 0; x < this.props.xsize; x++) {
      var y = -1;
      coords.push(<Coordinate x={x} y={y} key={x + '' + y} text={alphabet[x]}/>);
    };
    for(var y = 0; y < this.props.ysize; y++) {
      var x = -1;
      coords.push(<Coordinate x={x} y={y} key={x + '' + y} text={y + ''}/>);
    };

    var cells = [];
    for(var x = 0; x < this.props.xsize; x++) {
      for(var y = 0; y < this.props.ysize; y++) {
        var cellProps = {
          key: x + ' ' + y,
          x: x,
          y: y
        };
        cells.push(<Cell {...cellProps} onCellClick={this.handleCellClick.bind(this, cellProps)}/>);
      };
    };

    var ships = this.state.ships.map((ship, index) => {
      var shipProps = {
        key: index,
        ship: ship,
        selected: (this.state.selected == ship),
        onShipClick: this.handleShipClick.bind(this, ship),
        onShipDoubleClick: this.pivotShip.bind(this, ship)
      }
      return (<Ship {...shipProps}/>);
    });

    var viewBox = [-10, -10, (this.props.xsize + 1) * 10, (this.props.ysize + 1) * 10];

    return (
      <div className="setup-board">
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