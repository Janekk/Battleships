var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var Actions = require('./actions');

var cellSize = 40;

var GameBoardStore = require('./stores/GameBoardStore');
var ClipboardStore = require('./stores/ClipboardStore');

var GameBoardSvg = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function () {
    return {
      ships : [],
      selected: null
    };
  },

  componentDidMount: function() {
    this.listenTo(GameBoardStore, this.loadGameBoard);
    this.listenTo(ClipboardStore, this.setSelection)
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

  handleCellClick: function(ev) {
    var cell = this.getCell(ev);
    Actions.setup.selectCell(cell);
  },

  getCell: function(event) {
    return {
      x: Math.floor((event.pageX - event.currentTarget.offsetLeft) / cellSize),
      y: Math.floor((event.pageY - event.currentTarget.offsetTop) / cellSize)
    };
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
    this.state.ships.forEach(function (ship, index) {
      ships.push(<Ship key={index} ship={ship} selected={this.state.selected == ship} onShipClick={this.handleShipClick.bind(this, ship)}/>)
    }.bind(this));

    return (
      <div>
        <p>{"Table name: " + this.props.name}</p>
        <div className="gameboard-table" onClick={this.handleCellClick}>
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