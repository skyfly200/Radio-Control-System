const clever = require('./clever/clever');
const pug = require('pug');
const fs =  require("fs")
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
var app = express();
const events = require('./db/events-db');

// test db functions
events.open();
events.register('Test Show', 'show', '12/31/99', '00:00-24:00', '0', 'test.m3u', 'test');
events.all();
events.delete('Test Show');
events.close();

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// set public directory
app.use(express.static('public'));

// Compile PUG templates
fs.writeFile("public/clever-cmd.htm", pug.renderFile("public/clever-cmd.pug", {}),  function(err) {
   if (err) { return console.error(err); }
});
fs.writeFile("public/add-event.htm", pug.renderFile("public/add-event.pug", {}),  function(err) {
   if (err) { return console.error(err); }
});

// <<<- Setup Routing ->>>
// root url
app.get('/', function (req, res) {
  res.send('Put Radio Control System Api Docs Here!');
})

// <- Clever Interface ->
// get clever command form
app.get('/form', function (req, res) {
  res.sendFile( __dirname + "/public/clever-cmd.htm" );
})

// get clever command
app.get('/clever', function (req, res) {
  var cmd = req.query.command;
  var arg = req.query.arg;
  res.end(clever.cleverCmd(cmd, arg));
})

// <- Events Interface ->
// get new event form
app.get('/add-event', function (req, res) {
  res.sendFile( __dirname + "/public/add-event.htm" );
})

// process post request to add a new event
app.post('/new-event', function (req, res) {
  var cmd = req.query.command;
  var arg = req.query.arg;
  res.end(clever.cleverCmd(cmd, arg));
})


// <<<- Start the Express App ->>>
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
