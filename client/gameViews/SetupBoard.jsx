var React = require('react/addons')
  , _ = require('lodash')
  , Actions = require('./../actions')
  , {Cell} = require('./board/Cell')
  , Coordinate = require('./board/Coordinate')
  , Ship = require('./board/Ship');

var SetupBoard = React.createClass({

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
    Actions.setup.selectCell(cell, this.props.setup.ships);
  },

  render() {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', coords = [];
    var selectedId, {setup} = this.props;
    if (setup.selected) {
      if (setup.selected.type == 'board') {
        selectedId = setup.selected.item.id;
      }
    }

    for(var x = 0; x < setup.config.boardSize; x++) {
      var y = -1;
      coords.push(<Coordinate x={x} y={y} key={x + '' + y} text={alphabet[x]}/>);
    };
    for(var y = 0; y < setup.config.boardSize; y++) {
      var x = -1;
      coords.push(<Coordinate x={x} y={y} key={x + '' + y} text={y + ''}/>);
    };

    var cells = [];
    for(var x = 0; x < setup.config.boardSize; x++) {
      for(var y = 0; y < setup.config.boardSize; y++) {
        var cellProps = {
          key: x + ' ' + y,
          x: x,
          y: y
        };
        cells.push(<Cell {...cellProps} onCellClick={this.handleCellClick.bind(this, cellProps)}/>);
      };
    };

    var ships = setup.ships.map((ship) => {
      var shipProps = {
        key: ship.id,
        ship: ship,
        selected: (selectedId == ship.id),
        onShipClick: this.handleShipClick.bind(this, ship),
        onShipDoubleClick: this.pivotShip.bind(this, ship)
      }
      return (<Ship {...shipProps}/>);
    });

    var viewBox = [-10, -10, (setup.config.boardSize + 1) * 10, (setup.config.boardSize + 1) * 10];

    return (
      <div className="board setup">
        <svg viewBox={viewBox.join(' ')}>
            {coords}
            {cells}
            {ships}
        </svg>
      </div>
    );
  }
});

module.exports = SetupBoard;