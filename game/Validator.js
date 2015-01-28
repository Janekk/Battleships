module.exports = {
  validateUserId: function(userId) {
    if(!(/^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF0-9]{3,16}$/).test(userId)) {
      return 'UserID has to be between 4 and 16 characters long and cannot start with a number!';
    }
  }

};