var React = require('react')
  , Reflux = require('reflux')
  , Actions = require('../actions')
  , phase = require('../gamePhase')
  , SetupStore = require('../stores/SetupStore')
  , ConfigPanel = require('./ConfigPanel')
  , SetupBoard = require('./SetupBoard');

var SetupView = React.createClass({
  mixins: [Reflux.listenTo(SetupStore, 'onSetupStateChange')],

  onSetupStateChange(setup) {
    this.setState({setup});
  },

  componentWillMount() {
    this.onSetupStateChange(SetupStore.getState());
  },

  placeShips() {
    Actions.setup.placeShips();
  },

  render() {
    return (
      <div className="setup">
        {this.state.setup.config ?
          <div>
            <div className="command">
              Place ships on the gameboard by selecting a ship and clicking on a target field. Double-click to pivot the ship. Ships can't be adjacent to each other!
            </div>
            <div className="side">
              <div className="confirm">
                <button type='button' className="btn btn-default" disabled={!this.state.setup.allPlaced} onClick={this.placeShips}>
                  <span className="fa fa-check"></span>
                  Ready!
                </button>
              </div>
              <ConfigPanel setup={this.state.setup} />
            </div>
            <SetupBoard setup={this.state.setup} />
          </div> : null}
      </div>);
  }
});

module.exports = SetupView;
