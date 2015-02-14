var React = require('react')
  , utils = require('./utils/domUtils');

var ModalBox = React.createClass({

  getInitialState() {
    return {
      show: false,
      question: null,
      confirmText: 'Yes',
      declineText: 'No',
      action: null
    }
  },

  componentDidMount: function() {
    window.addEventListener("keydown", this.closeOnEscape);
  },
  componentWillUnmount: function() {
    window.removeEventListener("keydown", this.closeOnEscape);
  },

  confirm() {
    this.setState(this.getInitialState());
    this.state.action();
  },

  decline() {
    this.setState(this.getInitialState());
  },

  show(question, action, opts) {
    var {state} = this;
    if (question) {
      var confirmText = (opts && opts.confirmText) ? opts.confirmText: state.confirmText;
      var declineText = (opts && opts.declineText) ? opts.declineText: state.declineText;
      this.setState({show: true, question, action, confirmText, declineText});
    }
  },

  closeOnEscape(e) {
    if(e.keyCode == 27) {
      this.decline();
    }
  },

  onOverlayClick(e) {
    if(!utils.isElementChildOf(e.target, this.refs.box.getDOMNode())) {
      this.decline();
    }
  },

  render() {
    var {state} = this;
    return (
      <div id="overlay" className={state.show ? "visible" : null } onClick={this.onOverlayClick}>
      {state.show ?
        <div className="box" ref="box" onKeyDown={this.closeOnEscape}>
          <div className="question">{state.question}</div>
          <div className="buttons">
            <button className="btn btn-default" onClick={this.confirm}>{state.confirmText}</button>
            <button className="btn btn-primary" onClick={this.decline}>{state.declineText}</button>
          </div>
        </div> : null
        }
      </div>
    )
  }
});

module.exports = ModalBox;