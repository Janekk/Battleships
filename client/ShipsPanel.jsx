var React = require('react');
var _ = require('lodash');

var cellSize = 40;

var ShipsPanel = React.createClass({

  getInitialState: function () {
    return {
      selected: undefined
    };
  },

  onDragOver: function (ev) {
    ev.preventDefault();
  },

  handleShipModelClick: function (ship) {
    this.props.handleClick(ship);
    this.setState(React.addons.update(this.state, {
      selected: {$set: ship.size}
    }));
  },

  render: function () {
    var config = _.sortBy(this.props.availableShips, function(cfg){return cfg.size;});
    var components = [];
    config.forEach(function(cfg) {
      var handleClick = this.handleShipModelClick.bind(this, {size: parseInt(cfg.size)});
      components.push(<ConfigurationShip size={cfg.size} key={cfg.size} selected={cfg.size==this.state.selected} count={cfg.count} onClick={handleClick}/>);
    }.bind(this));

    return (
      <div className="ships-panel" onDragOver={this.onDragOver}>
        {components}
      </div>
    );
  }
});

var ConfigurationShip = React.createClass({

  onDragStart: function (ev) {
    ev.dataTransfer.setData("text", JSON.stringify({size: this.props.size}));
  },

  render: function () {
    var props = {
      width: this.props.size * cellSize,
      height: cellSize
    }

    var cx = React.addons.classSet;
    var classes = cx({
      'config': true,
      'selected': this.props.selected
    });

    return (
      <div className="ship configuration-ship" draggable="true" onDragStart={this.onDragStart} onClick={this.props.onClick}>
        <svg {...props}>
          <g className={classes}>
            <rect {...props} className=''/>
            <text x="0" y="1em" >{"x" + this.props.count}</text>
          </g>
        </svg>
      </div>
    );
  }
});

module.exports = ShipsPanel;