var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var Actions = require('./actions');
var ShipPopup = require('./SetupBoardPopup.jsx');
var Cell = require('./Board/Cell.jsx');
var Ship = require('./Board/Ship.jsx');

var BoardStore = require('./stores/BoardStore');
var ClipboardStore = require('./stores/ClipboardStore');

var SetupBoard = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function () {
    return {
      ships : [],
      selected: null
    };
  },

  componentDidMount: function() {
    this.listenTo(BoardStore, this.loadGameBoard);
    this.listenTo(ClipboardStore, this.setSelection);
  },

  loadGameBoard: function(gameboard) {
    this.setState(gameboard);
  },

  setSelection: function(clipboard) {
    if(clipboard.type == 'board' && clipboard.action == 'select') {
      this.setState({selected: clipboard.item});
    }
    else if(clipboard.type == 'config' && clipboard.action == 'select') {
      this.setState({selected: null});
    }
  },

  handleShipClick: function (ship, event) {
    event.stopPropagation();
    Actions.setup.selectShip(ship);
  },

  handleCellClick: function(cellProps) {
    var cell = {x: cellProps.x, y: cellProps.y};
    Actions.setup.selectCell(cell, this.state.ships);
  },

  render: function () {
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

    return (
      <div>
        <p>{"Table name: " + this.props.name}</p>
        <div className="gameboard-table">
          {this.state.selected ? <ShipPopup /> : null}
          <svg width="100%" height="100%" viewBox={"0 0 " + this.props.xsize*10 + " " + + this.props.ysize*10}>
            {cells}
            {ships}
          </svg>
        </div>
      </div>
    );
  }
});

module.exports = SetupBoard;