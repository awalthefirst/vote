var express = require('express');
var path = require('path');
var logger = require('morgan');
var sessions = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var mypolls = require('./routes/mypolls');
var votes = require('./routes/votes');
var pollsApi = require('./routes/pollsApi');
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(sessions({
	cookieName:"votesession",
	secret:"fsfdfsgfsgfrsdfsdgfvdsfdsfs",
	duration: 30*60*1000,
	activeDuration:5 * 60 * 1000
}));

app.use(sessions({
	cookieName:"Voted",
	secret:"fsfdfsgffdsfsdfdsfdssgfrsdfsdgfvdsfdsfs",
	duration:100 * 7 * 24 * 60 * 60 * 1000
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/mypolls', mypolls);
app.use('/polls/all',pollsApi);
app.use('/votes/:name',votes);


//
app.get('*', function(req, res){
	res.status(404).end('error');
});

module.exports = app;
