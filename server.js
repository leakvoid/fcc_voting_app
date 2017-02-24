'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();
if(process.env.MONGODB_URI === undefined)
    require('dotenv').load();
require('./app/config/passport')(passport);

app.set( 'views', require('path').join(__dirname, 'app/views') );
app.set('view engine', 'ejs');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use('/polls/client_js', express.static(process.cwd() + '/app/views/polls'));//CHECK
app.use('/polls/:poll_id/client_js', express.static(process.cwd() + '/app/views/polls'));//CHECK

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'secretClementine',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
    console.log('Node.js listening on port ' + port + '...');
});
