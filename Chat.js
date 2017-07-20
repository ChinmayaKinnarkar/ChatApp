var express= require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
 user: String,
 msg: String,
 created: {type:Date, default: Date.now}
});

var Chat = mongoose.model('Chat',chatSchema);

mongoose.connect('mongodb://localhost/chat');
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));

var routes = require('./app');
var Chat = express();