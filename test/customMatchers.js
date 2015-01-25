var _ = require('lodash');

var customMatchers = {
  toContainWhere: function (expected) {
    var result = {};

    var actualIsArray = Object.prototype.toString.apply(this.actual) === '[object Array]';

    //Jasmine will look for this function and utilize it for custom error messages
    this.message = function () {
      if (actualIsArray) {
        return "Expected actual array to contain items like expected";
      }
      return "Expected actual to be an Array";
    };

    if(actualIsArray) {
      return !!_.find(this.actual, expected);
    }
    return false;
  }
}

module.exports = customMatchers;