var React = require('react')
  , Actions = require('../actions')
  , phase = require('../gamePhase');

var FbSignInView = React.createClass({
  //
  //signIn(e) {
  //  e.preventDefault();
  //  var userName = this.refs.userName.getDOMNode().value;
  //  if (userName) {
  //    Actions.init.signIn(userName);
  //  }
  //},

  render() {
    return (
      <div className="sign-in">
        <p>Please sign-in to Facebook!</p>
        <img src="/images/preview.png" />
        <p>Or play the standalone version at <a href="http://battleships.mobi">battleships.mobi</a></p>
      </div>);
  }
});

module.exports = FbSignInView;
