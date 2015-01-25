var SetStateMixin = {

  setStateIfMounted: function(partialState, callback) {
    if(this.isMounted()) {
      this.setState(partialState, callback);
    }
  }
};

module.exports = SetStateMixin;