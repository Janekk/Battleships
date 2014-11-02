var React = require('react');
var GameBoardSvg = require('./GameBoardSvg.jsx');
var ShipsPanel = require('./ShipsPanel.jsx');

var _ = require('lodash');

var GamePanel = React.createClass({

  getInitialState: function() {
    return {
      board: this.props.myBoard,
      shipsConfiguration: this.props.shipsConfiguration,
      droppedShip: undefined,
      selectedConfigShip: undefined
    }
  },

  handleShipDrop: function(ship) {
    this.setState(React.addons.update(this.state, {
      board: {ships: {$push: [ship]}}
    }));
  },

  handleGameBoardClick: function(cell, shipCalculation) {
    if(this.state.selectedConfigShip) {
      var cells = shipCalculation(cell, this.state.selectedConfigShip);

      this.setState(React.addons.update(this.state, {
        board: {ships: {$push: [{name: "red", cells: cells}]}},
        shipsConfiguration: {availableShips: {$set: this.state.shipsConfiguration.availableShips.map(function(cfg) {
          if(cfg.size == this.state.selectedConfigShip.size) {
            cfg.count--;
          }
          return cfg;
        }.bind(this))}},
        selectedConfigShip: {$set: undefined}
      }));
    }
  },

  handleShipPanelClick: function(ship) {
    this.setState(React.addons.update(this.state, {
      selectedConfigShip: {$set: ship}
    }));
  },

  render: function () {
    return (
      <div className="panel">
        <div className="board">
          <GameBoardSvg {...this.state.board} handleShipDrop={this.handleShipDrop} handleClick={this.handleGameBoardClick} dropped={this.state.droppedShip}/>
          //<GameBoardSvg {...this.props.oppBoard}/>
        </div>
        <ShipsPanel {...this.state.shipsConfiguration} handleClick={this.handleShipPanelClick} selected={this.state.selectedConfigShip}/>
      </div>
    );
  }
});


module.exports = GamePanel;
