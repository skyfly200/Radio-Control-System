const clever = require('./clever/clever');
const pug = require('pug');
const fs =  require("fs")
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
var app = express();
const events = require('./db/events-db');


// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// set public directory
app.use(express.static('public'));

// Compile PUG templates
fs.writeFile("public/form.htm", pug.renderFile("public/form.pug", {}),  function(err) {
   if (err) { return console.error(err); }
});

// <<<- Setup Routing ->>>
// root url
app.get('/', function (req, res) {
  res.send('Put Radio Control System Api Docs Here!');
})

// get clever command form
app.get('/form', function (req, res) {
  res.sendFile( __dirname + "/public/form.htm" );
})

// get clever command
app.get('/clever', function (req, res) {
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
