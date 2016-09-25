const clever = require('./clever/clever');
const pug = require('pug');
const fs =  require("fs")
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
var app = express();
const events = require('./db/events-db');

// test db functions
//events.open();
//events.register('Test Show', 'show', '12/31/99', '00:00-24:00', '0', 'test.m3u', 'test');
//events.deleteAll();
//events.printAll();
//console.log("All Events:");
//events.all( function(events) {
//  console.log(events);
//});
//events.delete('Test Show');
//events.close();

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// set public directory
app.use(express.static('public'));

// set PUG to be used for template
app.set('view engine', 'pug');

// <<<- Setup Routing ->>>
// root url
app.get('/', function (req, res) {
  res.send('Put Radio Control System Api Docs Here!');
});

// <- Clever Interface ->
// render clever command form
app.get('/clever-cmd', function (req, res) {
  res.render( "clever-cmd" );
});

// get clever command
app.get('/clever', function (req, res) {
  clever.cleverCmd(req.query.command, req.query.arg, function(result) {
    res.end(result);
  });
});

// <- Events Interface ->
// render new event form
app.get('/add-event', function (req, res) {
  res.render( "add-event" );
});

// process post request to add a new event
app.post('/new-event', urlencodedParser, function (req, res) {
  var p = req.body; // get parameters
  events.open();
  events.register(p.title, p.type, p.date, p.time, p.priority, p.file, p.notes);
  res.end('registered event');
  events.close();
});

// return a list of json encoded events
app.get('/events', function(req, res) {
  events.open();
  events.all( function(result) {
    for (event in result) {
      res.write(event + ': ' + result[event].title + '\n');
    }
    res.end();
    events.close();
  });
});

// <<<- Start the Express App ->>>
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});
