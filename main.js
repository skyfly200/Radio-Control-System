const clever = require('./clever/clever');
const pug = require('pug');
const fs = require('fs-extra');
const url = require('url');
const bodyParser = require('body-parser');
const express = require('express');
var formidable = require('formidable');
var util = require('util');
var app = express();
const events = require('./db/events-db');


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

// <- File Upload ->
// file upload form
app.get('/file-upload', function (req, res) {
  res.render( "file-upload" );
});

// file upload handler
app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end('received upload!');
  });

  form.on('end', function(fields, files) {
    /* Temporary location of our uploaded file */
    var temp_path = this.openedFiles[0].path;
    /* The file name of the uploaded file */
    var file_name = this.openedFiles[0].name;
    /* Location where we want to copy the uploaded file */
    var new_location = './content/';

    fs.copy(temp_path, new_location + file_name, function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log("success!")
      }
    });
  });
});

// <- Clever Interface ->
// render clever command form
app.get('/clever-cmd', function (req, res) {
  res.render( "clever-cmd" );
});

// get clever command
app.get('/clever', function (req, res) {
  clever.cleverCmd(req.query.command, req.query.arg, function(result) {
    res.end(JSON.stringify(result));
  });
});

// <- Events Interface ->
// render new event form
app.get('/add-event', function (req, res) {
  res.render( "add-event" );
});

// process post request to add a new event
app.post('/post-event', urlencodedParser, function (req, res) {
  var p = req.body; // get POST parameters
  events.open();
  events.register(p.title, p.type, p.date, p.time, p.priority, p.file, p.notes);
  res.end('registered event');
  events.close();
});


// respond with a json encoded list of all events
app.get('/get-events', function(req, res) {
  events.open();
  events.all( function(result) {
    res.end(JSON.stringify(result));
    events.close();
  });
});

// respond with a json encoded list of all events with matching values
app.get('/get-event', function(req, res) {
  // arrays of parameters to match against
  var names = [];
  var values = [];

  var p = req.query; // set p to GET parameters
  // arrays of all posible parameters and their set values
  var paramNames = ['title', 'type', 'date', 'time', 'priority', 'file', 'notes'];
  var params = [p.title, p.type, p.date, p.time, p.priority, p.file, p.notes];

  // determine what parameters are defined and append them to matching arrays
  for (p in params) {
    if (params[p] != undefined && params[p] != '') {
      names.push(paramNames[p]);
      values.push(params[p]);
    }
  }

  // open the db and execute the querry on the database
  events.open();
  events.find(names, values, function(result) {
    // return the results as json and close the db
    res.end(JSON.stringify(result));
    events.close();
  });
});

// update all events with matching values
app.post('/update-event', urlencodedParser, function(req, res) {
  // arrays of parameters to match against
  var names = [];
  var values = [];
  // arrays of parameters to update
  var updateNames = [];
  var updateValues = [];

  var p = req.body; // set p to POST parameters
  // arrays of all parameter names and values set for them
  var paramNames = ['title', 'type', 'date', 'time', 'priority', 'file'];
  var params = [p.title, p.type, p.date, p.time, p.priority, p.file];
  var newParams = [p.title_u, p.type_u, p.date_u, p.time_u, p.priority_u, p.file_u];

  // determine what parameters are defined and append them to matching arrays
  for (p in params) {
    if (params[p] != undefined) {
      names.push(paramNames[p]);
      values.push(params[p]);
    }
  }
  // determine what update parameters are defined and append them to update arrays
  for (p in newParams) {
    if (newParams[p] != undefined) {
      updateNames.push(paramNames[p]);
      updateValues.push(newParams[p]);
    }
  }

  // open the db and execute the querry on the database
  events.open();
  events.update(names, values, updateNames, updateValues, function(result) {
    // return result of delete and close db
    var output = JSON.stringify(result);
    if (output != '' || output != undefined ) { res.end(output); }
    else { res.end(false); }
    events.close();
  });
});


// delete all events with matching values
app.post('/delete-event', urlencodedParser, function(req, res) {
  // arrays of parameters to match against
  var names = [];
  var values = [];

  var p = req.body; // set p to POST parameters
  // arrays of all parameter names and values set for them
  var paramNames = ['title', 'type', 'date', 'time', 'priority', 'file'];
  var params = [p.title, p.type, p.date, p.time, p.priority, p.file];

  // determine what parameters are defined and append them to matching arrays
  for (p in params) {
    if (params[p] != undefined) {
      names.push(paramNames[p]);
      values.push(params[p]);
    }
  }

  // open the db and execute the querry on the database
  events.open();
  events.delete(names, values, function(result) {
    // return result of delete and close db
    var output = JSON.stringify(result);
    if (output != '' || output != undefined ) { res.end(output); }
    else { res.end(false); }
    events.close();
  });
});

// <<<- Start the Express App ->>>
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});
