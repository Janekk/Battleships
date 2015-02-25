var React = require('react')
  , _ = require('lodash')
  , Actions = require('./../actions');

var ConfigPanel = React.createClass({

  handleItemClick(item) {
    if(item.count > 0) {
      Actions.setup.selectConfigItem(item);
    }
  },

  render() {
    var selected, {setup} = this.props;

    if(setup.selected) {
      if (setup.selected.type == 'config') {
        selected = setup.selected.item;
      }
      else {
        selected = null;
      }
    }

    var config = setup.config ? _.sortBy(setup.config.ships, (cfg) => {return -cfg.size;}) : [];
    var selectedSize = selected ? selected.size : null;

    var components = [];
    config.forEach((cfg, index) => {
      var handleClick = this.handleItemClick.bind(this, cfg);
      components.push(<ConfigurationShip config={cfg} index={index} key={cfg.size} selected={cfg.size == selectedSize} count={cfg.count} onClick={handleClick}/>);
    });

    var svgViewbox = [0, 0, 120, (config.length * 10) +  12];
    return (
      <div className="ships-panel">
        <svg width="100%" height="100%" viewBox={svgViewbox.join(' ')}>
            {components}
        </svg>
      </div>
    );
  }
});

var ConfigurationShip = React.createClass({

  render() {
    var props = {
      x: (5 - this.props.config.size) * 10,
      y: 2 + (this.props.index * 12),
      width: this.props.config.size * 10,
      height: 10
    };

    var cx = React.addons.classSet;
    var classes = cx({
      'config': true,
      'selected': this.props.selected && (this.props.count > 0),
      'inactive': (this.props.count == 0),
      'ship': true,
      'configuration-ship': true
    });

    return (
      <g>
        <g className={classes} onClick={this.props.onClick}>
          <rect {...props} />
          <text x={props.x + props.width - 10} y={props.y + 8}>{"x" + this.props.count}</text>
        </g>
        <g className={classes}>
          <text x={props.x + props.width + 2} y={props.y + 8}>{this.props.config.name}</text>
        </g>
      </g>
    );
  }
});

module.exports = ConfigPanel;