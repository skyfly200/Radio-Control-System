const clever = require('./clever');
const url = require('url');
const express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// set public directory
app.use(express.static('public'));

// <<<- Setup Routing ->>>
app.get('/', function (req, res) {
  res.send('Put Radio Control System Api Docs Here!');
})

app.get('/all', function (req, res) {
  var output = clever.cleverCmd("loadplay", "All.m3u");
  console.log( output );
  res.send( output );
})

app.get('/relay', function (req, res) {
  var output = clever.cleverCmd("loadplay", "whr-relay1.m3u");
  console.log( output );
  res.send( output );
})

app.get('/formG', function (req, res) {
  res.sendFile( __dirname + "/public/formG.htm" );
})

app.get('/formP', function (req, res) {
  res.sendFile( __dirname + "/public/formP.htm" );
})

app.get('/clever', function (req, res) {
  var output = clever.cleverCmd(req.query.command);
  console.log( output );
  res.send( output );
})

app.post('/clever', urlencodedParser, function (req, res) {
  var output = clever.cleverCmd(req.body.command, req.body.arg);
  console.log( output );
  res.send( output );
})

// <<<- Start the Express App ->>>
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
