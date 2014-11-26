var React = require('react')
  , _ = require('lodash')
  , Reflux = require('reflux')
  , Actions = require('./actions')
  , SetupStore = require('./stores/SetupStore');

var ShipsPanel = React.createClass({
  mixins: [Reflux.ListenerMixin],

  componentDidMount: function() {
    this.loadData(SetupStore.data);
    this.listenTo(SetupStore, this.loadData);
  },

  loadData : function(data) {
    var state = {};
    if(data.config) {
      state.items = data.config;
    }
    if('selected' in data && data.selected) {
      if (data.selected.type == 'config') {
        state.selected = data.selected.item;
      }
      else {
        state.selected = null;
      }
    }
    this.setState(state);
  },

  getInitialState: function () {
    return {
      items: null,
      selected: null
    };
  },

  handleItemClick: function (item) {
    if(item.count > 0) {
      Actions.setup.selectConfigItem(item);
    }
  },

  render: function () {
    var config = _.sortBy(this.state.items, function(cfg){return cfg.size;});
    var selectedSize = this.state.selected ? this.state.selected.size : null;

    var components = [];
    config.forEach(function(cfg, index) {
      var handleClick = this.handleItemClick.bind(this, cfg);
      components.push(<ConfigurationShip size={cfg.size} index={index} key={cfg.size} selected={cfg.size == selectedSize} count={cfg.count} onClick={handleClick}/>);
    }.bind(this));

    return (
      <div>
        <svg width="100%" height="100%" viewBox="0 0 30 30">
            {components}
        </svg>
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
      x: 0,
      y: this.props.index * 10,
      width: this.props.size * 10,
      height: 10
    };

    var cx = React.addons.classSet;
    var classes = cx({
      'config': true,
      'blink': true,
      'selected': this.props.selected,
      'inactive': (this.props.count == 0),
      'ship': true,
      'configuration-ship': true
    });

    return (
      <g className={classes} onClick={this.props.onClick}>
        <rect {...props} />
        <text x={props.x} y={props.y + 8} >{"x" + this.props.count}</text>
      </g>
    );
  }
});

module.exports = ShipsPanel;