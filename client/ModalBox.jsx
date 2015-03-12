var React = require('react')
  , utils = require('./utils/domUtils');

var ModalBox = React.createClass({

  getDefaultProps() {
    return {
      question: null,
      confirmText: 'Yes',
      declineText: 'No',
      action: null
    }
  },

  getInitialState() {
    return {
      show: true
    }
  },

  componentWillReceiveProps() {
    this.setState({show: true});
  },

  componentDidMount: function() {
    window.addEventListener("keydown", this.closeOnEscape);
  },
  componentWillUnmount: function() {
    window.removeEventListener("keydown", this.closeOnEscape);
  },

  confirm() {
    this.setState({show: false});
    if(this.props.action) {
      this.props.action();
    }
  },

  decline() {
    this.setState({show: false});
    if(this.props.decline) {
      this.props.decline();
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
    var {state, props} = this;
    return (
      <div id="overlay" className={state.show ? "visible" : null } onClick={this.onOverlayClick}>
      {state.show ?
        <div className="box" ref="box" onKeyDown={this.closeOnEscape}>
          <div className="question">{props.question}</div>
          <div>{props.children}</div>
          {props.mode == 'ok' ?
            (<div className="buttons">
              <button className="btn btn-default" onClick={this.decline}>OK</button>
            </div>)
            :
            (<div className="buttons">
              <button className="btn btn-default" onClick={this.confirm}>{props.confirmText}</button>
              <button className="btn btn-primary" onClick={this.decline}>{props.declineText}</button>
            </div>)
          }
        </div> : null
        }
      </div>
    )
  }
});

var ModalBoxWrapper = function(ModalBox, element) {
  this.show = function(question, action, opts) {
    if (question) {
      var props = {question, action};
      if(opts && opts.confirmText) {
        props.confirmText = opts.confirmText;
      }
      if(opts && opts.declineText) {
        props.declineText = opts.declineText;
      }
      React.render(<ModalBox {...props} />, element);
    }
  };
};

module.exports = {ModalBox, ModalBoxWrapper};