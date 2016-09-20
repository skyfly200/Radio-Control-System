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
  clever.cleverCmd("loadplay", "All.m3u");
  console.log( "loadplaying All.m3u" );
  res.send( "loadplaying All.m3u" );
})

app.get('/relay', function (req, res) {
  clever.cleverCmd("loadplay", "whr-relay1.m3u");
  console.log("loadplaying whr-relay1.m3u");
  res.send( "loadplaying whr-relay1.m3u" );
})

app.get('/form', function (req, res) {
  res.sendFile( __dirname + "/public/form.htm" );
})

app.get('/clever', function (req, res) {
  var cmd = req.query.command;
  var arg = req.query.arg;
  clever.cleverCmd(cmd, arg);
  if (arg === undefined) { arg = ""; }
  res.end("running clever " + cmd + " " + arg);
})

// <<<- Start the Express App ->>>
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
