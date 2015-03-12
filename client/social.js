var React = require('react')
  , Reflux = require('reflux')
  , _ = require('lodash')
  , Actions = require('./actions');

var social = function() {
  var friendCache = {}, signInCallback;

  this.signIn = function(callback) {
    signInCallback = callback;

    FB.init({
      appId: '633605170101399',
      frictionlessRequests: true,
      status: true,
      version: 'v2.2'
    });

    //FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
    FB.Event.subscribe('auth.statusChange', onStatusChange);
    FB.getLoginStatus(function(response) {
      if(response.status != 'connected') {
        signInCallback.error();
      };
    });
  };

  function login(callback) {
    FB.login(callback, {scope: 'user_friends'});
  }

  function loginCallback(response) {
    console.log('loginCallback',response);
    if(response.status != 'connected') {
      signInCallback.error();
    }
  }

  function onStatusChange(response) {
    if( response.status != 'connected' ) {
      login(loginCallback);
    } else {
      getMe(function() {
        deletePendingRequests();
        signInCallback.success(friendCache.me);
      });
    }
  }
  //function onAuthResponseChange(response) {
  //  console.log('onAuthResponseChange', response);
  //}

  function getMe(callback) {
    FB.api('/me', {fields: 'id,name,first_name,picture.width(50).height(50)'}, function(response){
      if( !response.error ) {
        friendCache.me = response;
        callback();
      } else {
        console.error('/me', response);
      }
    });
  }

  function deletePendingRequests() {
    FB.api('/me/apprequests', function(response){
      if( !response.error ) {
        var requestIds = response.data.map((req) => {
          return req.id;
        });

        var batch = requestIds.map((requestId) => {
          return {method: 'DELETE', relative_url: '/' + requestId};
        });

        FB.api('/', 'POST', {batch});

      } else {
        console.error('/me/apprequests', response);
      }
    });
  }
};

module.exports = new social();
