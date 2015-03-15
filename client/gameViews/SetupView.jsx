var React = require('react')
  , Reflux = require('reflux')
  , Actions = require('../actions')
  , phase = require('../gamePhase')
  , SetupStore = require('../stores/SetupStore')
  , ConfigPanel = require('./ConfigPanel')
  , SetupBoard = require('./SetupBoard');

var SetupView = React.createClass({
  mixins: [Reflux.listenTo(SetupStore, 'onSetupChange')],

  onSetupChange(setup) {
    this.setState({setup});
  },

  componentWillMount() {
    this.onSetupChange(SetupStore.getState());
  },

  placeShips() {
    Actions.setup.placeShips();
  },

  render() {
    var {state} = this;
    return (
      <div className="setup">
        {state.setup.config ?
          <div>
            <div className="command">
              Place ships on the gameboard by selecting a ship and clicking on a target field. Double-click to pivot the ship. Ships can't be adjacent to each other!
            </div>
            <div className="side">
              <div className="confirm">
                <button type='button' className="btn btn-default" disabled={!state.setup.allPlaced} onClick={this.placeShips}>
                  <span className="fa fa-check"></span>
                  Ready!
                </button>
              </div>
              <ConfigPanel setup={state.setup} />
            </div>
            <SetupBoard setup={state.setup} />
          </div> : null}
      </div>);
  }
});

module.exports = SetupView;
