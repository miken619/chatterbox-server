var app = {
  init: function() {
    this.server = 'http://parse.la.hackreactor.com/chatterbox/classes/messages';
    $('.submit').on('submit', app.handleSubmit);
    $('#chats').on('click', '.username', app.handleUsernameClick);
  }
};
$('document').ready(function() {
  
  var friends = {};
  var rooms = {
    lobby: 1
  };
  var currentRoom = null;

  app.send = function(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'http://127.0.0.1:3000/',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('success: ', data);
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  };

  app.fetch = function(roomID) {
    app.clearMessages();
    if (roomID && roomID !== 'select a room') {
      var fn = function (data) {
        for (var i = 0; i < data.results.length; i++) {
          if (!rooms[data.results[i].roomname]) {
            app.renderRoom(data.results[i].roomname);
          }
          if (data.results[i].roomname === roomID) {
            app.renderMessage(data.results[i]);
          }
        }
      };
    } else {
      var fn = function (data) {
        for (var i = 0; i < data.results.length; i++) {
          if (!rooms[data.results[i].roomname]) {
            app.renderRoom(data.results[i].roomname);
          }
          app.renderMessage(data.results[i]);
        }
      };
    }
    return $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'http://127.0.0.1:3000/',
      //cache: false,
      type: 'GET',
      contentType: 'application/json',
      data: 'order=-createdAt',
      success: function (data) {
        fn(data);
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to get message', data);
      }
    });
  };

  app.clearMessages = function() {
    $('#chats').empty();
  };

  app.escapeHtml = function(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  };

  app.renderMessage = function(val) {
    var username = app.escapeHtml(val.username);
    var text = app.escapeHtml(val.text);
    if (username in friends) {
      $('#chats').append('<div><strong><button class = "username">@' + username + '</button>: ' + text + '</strong></div>');
    } else {
      $('#chats').append('<div><button class = "username">@' + username + '</button>: ' + text + '</div>');
    }
    //html('<blink>OMG IT\'s 1998!</blink>');
  };

  app.renderRoom = function(val) {
    rooms[val] = 1;
    val = app.escapeHtml(val);
    $('#roomSelect').append('<option value="' + val + '">' + val + '</option>');
    //<option value="audi">Audi</option>;
  };

  app.handleUsernameClick = function() {
    friends[this.innerHTML.slice(1)] = 1;
    app.fetch();
  };

  var message = {
    username: 'shawndrost',
    text: 'Hello this is a message',
    roomname: 'testing'
  };

  app.init();
  app.fetch();
  //app.renderRoom('testing');

  $('#roomSelect').change(function() {
    currentRoom = $(this).val();
    app.fetch($(this).val());
  });

  

  app.handleSubmit = function() {
    var text = $('#message').val();
    var message = {};
    message.username = window.location.search.slice(window.location.search.indexOf('=') + 1);
    message.text = text;
    var room = null;
    if ($('#roomSelect').val() === 'select a room') {
      room = 'lobby';
    } else {
      room = $('#roomSelect').val();
    }
    message.roomname = room;
    app.send(message);
    app.fetch(room);
    $('#message').val('');
  };

  $('#message').keypress(function (e) {
    if (e.which === 13) {
      app.handleSubmit();
      e.preventDefault();
    }
  });


  $('.submit').on('click', app.handleSubmit);

  $('#chats').on('click', '.username', app.handleUsernameClick);
  
  setInterval(function() {
    app.fetch(currentRoom);
  }, 5000);

  return app;
});







