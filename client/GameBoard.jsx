var React = require('react/addons');
var _ = require('lodash');

var GameBoard = React.createClass({
  getInitialState: function () {
    return {ships: this.props.ships};
  },

  handleCellClick: function (coords) {
    var ship = this.findShip(x, y);
    if(ship) {
      setState({ships: React.addons.update(this.state.ships, )})
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
    var divs = [];
    _.times(this.props.xsize, function (x) {
      _.times(this.props.ysize, function (y) {
        var ship = this.findShip(x, y);
        var cellProps = {
          ship: ship,
          key: x + ' ' + y,
          x: x,
          y: y,
          onCellClick: this.handleCellClick.bind(this, {x: x, y: y})
        }
        divs.push((Cell(cellProps)));
      }.bind(this));
    }.bind(this));

    return (
      <div onDragOver={this.allowDrop} onDrop={this.drop}>
        <p>{"Table name: " + this.props.name}</p>
        <div className="gameboard-table">
          {divs}
        </div>
      </div>
    );
  }
});

var Cell = React.createClass({
  render: function () {
    var divProps = {
      className: "cell" + (this.props.ship ? " " + this.props.ship.name : ""),
      id: this.props.x + '' + this.props.y + '',
      text: this.props.x + '|' + this.props.y + '|'
    }

    return (
      <div className={divProps.className} id={divProps.id} onClick={this.props.onCellClick}>
        {divProps.text}
      </div>)
  }
})

module.exports = GameBoard;