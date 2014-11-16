var React = require('react');
var _ = require('lodash');
var Reflux = require('reflux');
var Actions = require('./actions');
var ClipBoardStore = require('./stores/ClipboardStore');
var ConfigStore = require('./stores/ConfigStore');

var cellSize = 40;
var borderRadius = 5;

var ShipsPanel = React.createClass({
  mixins: [Reflux.ListenerMixin],

  componentDidMount: function() {
    this.listenTo(ConfigStore, this.loadData);
    this.listenTo(ClipBoardStore, this.clipboardItemChanged);
  },

  loadData : function(config) {
    this.setState({
      items: config.items,
      selected: null
    })
  },

  clipboardItemChanged : function(clipboard) {
    if(clipboard.action == 'select' && clipboard.type == 'config') {
      this.setState(React.addons.update(this.state, {
          selected: {$set: clipboard.item}}
      ));
    }
    else {
      this.setState(React.addons.update(this.state, {
          selected: {$set: null}}
      ));
    }
  },

  getInitialState: function () {
    return {
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
    config.forEach(function(cfg) {
      var handleClick = this.handleItemClick.bind(this, cfg);
      components.push(<ConfigurationShip size={cfg.size} key={cfg.size} selected={cfg.size == selectedSize} count={cfg.count} onClick={handleClick}/>);
    }.bind(this));

    return (
      <div>
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
      'blink': true,
      'selected': this.props.selected,
      'inactive': (this.props.count == 0)
    });

    return (
      <div className="ship configuration-ship" onClick={this.props.onClick}>
        <svg {...props}>
          <g className={classes}>
            <rect {...props} />
            <text x="0" y="1em" >{"x" + this.props.count}</text>
          </g>
        </svg>
      </div>
    );
  }
});

module.exports = ShipsPanel;