var express = require('express'),
  http = require('http');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
var Chat = require('./Chat.js');
var chatModel = mongoose.model('Chat');

users = {};
connections = [];

//set the path for files on computer
var path =require('path');

//connect to server
server.listen(process.env.Port || 3000);
console.log('listening on port 3000') 

//connect to mongodb
mongoose.connect('mongodb://localhost/chat',function(err) {
  if(err){
    console.log(err);
  } else{
    console.log('Connected to mongodb');
  }
});


//Chat Model to save chat data
var Chat = mongoose.model('Message',Chat);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');

});

io.sockets.on('connection', function(socket,user) {
   connections.push(socket);
   console.log('Connected: %s sockets connected', connections.length);


socket.on('disconnect', function(data) {
 //users.splice(users.indexOf(socket.username), 1);
 delete users[socket.username];
 updateUsernames();
 connections.splice(connections.indexOf(socket), 1);
 socket.broadcast.emit('broadcast',{ user: socket.username + ' has disconnected'});
 console.log('Disconnected: %s sockets conected', connections.length);
});

 //send message and save them
 socket.on('send message', function(data){
  console.log(data);
  var newMsg = new Chat({msg: data,user:socket.username});
  newMsg.save(function(err) {
    if (err) {throw err}
      else{
        io.sockets.emit('new message',{msg: data, user: socket.username});
      }
  });
 //io.sockets.emit('new message',{msg: data, user: socket.username});
  }); 

 //new User 
  socket.on('new user', function(data,callback){ 
    if (data in users) {
    callback(false);
  } else {
     callback(true); 
     socket.username = data; 
     users[socket.username] = socket;
     //users.push(socket.username);
     updateUsernames();
      }

   });

//retreiving old messages
var query= Chat.find({});
query.sort('-created').limit(8).exec(function(err,docs) {
  if (err) {throw err}
    console.log('sending old msgs');
    socket.emit('load old msgs', docs);
});

//broadcast
socket.broadcast.emit('broadcast',{ user: socket.username + ' has connected'});
  console.log(socket.username+' is online');
function updateUsernames(){
  io.sockets.emit('get users', Object.keys(users));
};

//showing msg on typing
    socket.on('typing', function() {
      socket.broadcast.emit('typing', socket.username + " : is typing...");
});

});