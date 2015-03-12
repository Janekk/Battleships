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

    var configShips = [];
    config.forEach((cfg, index) => {
      var shipProps = {
        config: cfg,
        index: index,
        key: cfg.size,
        selected: (cfg.size == selectedSize),
        onShipClick: this.handleItemClick.bind(this, cfg)
      };
      configShips.push(<ConfigurationShip {...shipProps}/>);
    });

    var svgViewbox = [0, 0, 120, (config.length * 10) +  12];
    return (
      <div className="ships-panel">
        <svg width="100%" height="100%" viewBox={svgViewbox.join(' ')}>
            {configShips}
        </svg>
      </div>
    );
  }
});

var ConfigurationShip = React.createClass({

  render() {
    var {props} = this, config;
    var svgProps = {
      x: (5 - props.config.size) * 10,
      y: 2 + (props.index * 12),
      width: props.config.size * 10,
      height: 10
    };

    var cx = React.addons.classSet;
    var classes = cx({
      'config': true,
      'selected': props.selected && (props.config.count > 0),
      'inactive': (props.config.count == 0),
      'ship': true,
      'configuration-ship': true
    });

    return (
      <g>
        <g className={classes} onClick={props.onShipClick}>
          <rect {...svgProps} />
          <text x={svgProps.x + svgProps.width - 10} y={svgProps.y + 8}>{"x" + props.config.count}</text>
        </g>
        <g className={classes}>
          <text x={svgProps.x + svgProps.width + 2} y={svgProps.y + 8}>{props.config.name}</text>
        </g>
      </g>
    );
  }
});

module.exports = ConfigPanel;