var React = require('react')
  , Actions = require('../actions')
  , phase = require('../gamePhase');

var FbSignInView = React.createClass({
  render() {
    return (
      <div className="sign-in">
        <p>Please sign-in to Facebook!</p>
        <p>Or play the standalone version at <a href="http://battleships.mobi" target="_blank">Battleships.mobi</a></p>
        <img src="/images/preview.png" />
      </div>);
  }
});

module.exports = FbSignInView;
