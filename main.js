// Radio Control System Server
// Contains:
// automation process for running events
// a REST API for controling the radio and automation process remotely

const clever = require('./clever/clever'); // clever script wrapper functions
const events = require('./db/events-db'); // events db functions
const auto = require('./automation/automation'); // event automation library
const pug = require('pug'); // templating engine
const fs = require('fs-extra'); // more advanced fs functions (using copy)
const url = require('url');
const bodyParser = require('body-parser'); // processes POST parameters
const express = require('express'); // express framework for managing API URI request and response
var formidable = require('formidable'); // file upload
var app = express();

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// set public directory
app.use(express.static('public'));

// set PUG to be used for template rendering
app.set('view engine', 'pug');

// load events and run automation every 60 seconds
auto.load('day', function () {
  auto.run();
  setInterval(auto.run, 60000);
});

// reload automation events from DB every hour
setInterval( function () { auto.load('day') }, 3600000);

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
    res.end(result);
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
  events.register(p.title, p.type, p.schedule, p.priority, p.file, p.notes, p.expire);
  auto.load('day');
  res.end('registered event');
});


// respond with a json encoded list of all events
app.get('/get-events', function(req, res) {
  events.all( function(result) {
    res.end(JSON.stringify(result));
  });
});

// respond with a json encoded list of all events with matching values
app.get('/get-event', function(req, res) {
  // arrays of parameters to match against
  var names = [];
  var values = [];

  var p = req.query; // set p to GET parameters
  // arrays of all posible parameters and their set values
  var paramNames = ['title', 'type', 'schedule', 'priority', 'file', 'notes', 'create', 'expire'];
  var params = [p.title, p.type, p.schedule, p.priority, p.file, p.notes, p.create, p.expire];

  // determine what parameters are defined and append them to matching arrays
  for (p in params) {
    if (params[p] != undefined && params[p] != '') {
      names.push(paramNames[p]);
      values.push(params[p]);
    }
  }

  // open the db and execute the querry on the database
  events.find(names, values, function(result) {
    // return the results as json and close the db
    res.end(JSON.stringify(result));
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
  var paramNames = ['id', 'title', 'type', 'schedule', 'priority', 'file', 'notes', 'create', 'expire'];
  var params = [p.id, p.title, p.type, p.schedule, p.priority, p.file, p.notes, p.create, p.expire];
  var updateParamNames = ['title', 'type', 'schedule', 'priority', 'file', 'notes', 'expire', 'history'];
  var updateParams = [p.title_u, p.type_u, p.schedule_u, p.priority_u, p.file_u, p.notes_u, p.expire_u, p.history_u];

  // determine what parameters are defined and append them to matching arrays
  for (p in params) {
    if (params[p] != undefined) {
      names.push(paramNames[p]);
      values.push(params[p]);
    }
  }

  // determine what update parameters are defined and append them to update arrays
  for (p in updateParams) {
    if (updateParams[p] != undefined) {
      updateNames.push(updateParamNames[p]);
      updateValues.push(updateParams[p]);
    }
  }

  // open the db and execute the querry on the database
  events.update(names, values, updateNames, updateValues, function(result) {
    // return result of delete and close db
    var output = JSON.stringify(result);
    res.end(output);
    if (output != '' || output != undefined ) {
      auto.load('day');
      res.end(output);
    }
    else { res.end(false); }
  });
});


// delete all events with matching values
app.post('/delete-event', urlencodedParser, function(req, res) {
  // arrays of parameters to match against
  var names = [];
  var values = [];

  var p = req.body; // set p to POST parameters
  // arrays of all parameter names and values set for them
  var paramNames = ['id', 'title', 'type', 'schedule', 'priority', 'file', 'notes', 'create', 'expire'];
  var params = [p.id, p.title, p.type, p.schedule, p.priority, p.file, p.notes, p.create, p.expire];

  // determine what parameters are defined and append them to matching arrays
  for (p in params) {
    if (params[p] != undefined) {
      names.push(paramNames[p]);
      values.push(params[p]);
    }
  }

  // open the db and execute the querry on the database
  events.delete(names, values, function(result) {
    // return result of delete and close db
    var output = JSON.stringify(result);
    if (output != '' || output != undefined ) {
      auto.load('day');
      res.end(output);
    }
    else { res.end(false); }
  });
});

// <<<- Start the Express App ->>>
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});
