var Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('../actions');

var FacebookStore = Reflux.createStore({
  init() {
    this.state = {
      friends: [],
      user: null
    };

    this.permissions = null;

    this.listenTo(Actions.init.signInToFb, this.signInToFb);
    this.listenTo(Actions.init.signInToGame, this.getFriendsAll);
    this.listenTo(Actions.init.inviteFriend, this.inviteFriend);
  },

  signInToFb(callback) {
    var social = require('../social');
    social.signIn({
      success: function (me) {
        this.state.user = me;
        Actions.init.signInToGame(me.id, me.name);
        this.trigger(this.state);
      }.bind(this),
      error: function () {
        this.state.user = null;
        this.trigger(this.state);
      }.bind(this)
    });
  },

  inviteFriend(friendId) {
    FB.ui({
        method: 'apprequests',
        message: 'Come play Battleships with me!',
        to: friendId
      },
      (result) => {
        if(result.error) {
          console.error(result);
        }
        else {
          var friend = _.find(this.state.friends, {id: friendId});
          if(friend) {
            friend.gotFbInvitation = true;
          }
          this.trigger(this.state);
        }
      }
    );
  },

  getFriendsAll() {

    this.getPermissions(function(){
      if(this.hasPermission('user_friends')) {
        this.getFriends();
      } else {
        //no permission for friends data
      }
    }.bind(this));

    this.trigger(this.state);
  },

  onFriendsResponse(data) {
    this.state.friends = data;
    this.trigger(this.state);
  },

  getFriends() {
    var reqOpts = {fields: 'id,name,first_name,picture.width(60).height(60)'};
    var reqHandler = new DeferredFriendsListHandler(this.onFriendsResponse);

    FB.api('/me/invitable_friends', reqOpts, reqHandler.deferred('/me/invitable_friends'));
    FB.api('/me/friends', reqOpts, reqHandler.deferred('/me/friends'));
  },

  getPermissions(callback) {
    FB.api('/me/permissions', function (response) {
      if (!response.error) {
        this.permissions = response.data;
        callback();
      } else {
        console.error('/me/permissions', response);
      }
    }.bind(this));
  },

  hasPermission(permission) {
    for (var i in this.permissions) {
      if (
        this.permissions[i].permission == permission
        && this.permissions[i].status == 'granted')
        return true;
    }
    return false;
  }
});

var DeferredFriendsListHandler = function(deferredCallback) {
  var pendingRequests = 0;
  var data = [];

  this.deferred = function(request) {
    pendingRequests++;

    var resolve = function(request, response) {
      pendingRequests--;
      if (!response.error) {
        data = data.concat(response.data);
      }
      else {
        console.error(request, response);
      }

      if (pendingRequests == 0) {
        deferredCallback(data);
      }
    }.bind(this, request);

    return resolve;
  };
};

module.exports = FacebookStore;
