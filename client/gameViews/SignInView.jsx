var React = require('react')
  , Actions = require('../actions')
  , phase = require('../gamePhase');

var SignInView = React.createClass({

  signIn(e) {
    e.preventDefault();
    var userName = this.refs.userName.getDOMNode().value;
    if (userName) {
      Actions.init.signIn(userName);
    }
  },

  render() {
    return (
      <div className="sign-in">
        <form onSubmit={this.signIn}>
          <div>
            <label className="sr-only" htmlFor="user-name">User name</label>
            <input type='text' name='user-name' ref='userName' placeholder='User name' autoFocus='autofocus' />
          </div>
          <div>
            <button type='submit' className="btn btn-primary">Join!</button>
          </div>
        </form>
      </div>);
  }
});

module.exports = SignInView;
