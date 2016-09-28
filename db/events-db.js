const sqlite3 = require('sqlite3').verbose();
var moment = require('moment');
var db;

validMatchParams = ['id', 'title', 'type', 'schedule', 'priority', 'file', 'created', 'expire'];

// open the database
// Create the events table in the database if it isn't already created
function openDB() {
  db = new sqlite3.Database('./db/configDB');
}

// register a new event
exports.register = function (title, type, schedule, priority, file, notes, expire) {
  openDB();
  db.serialize(function() {
    var id = null; // set to null to automaticly define the id
    var created = moment().format('YYYY MM DD hh:mm:ss');
    var history = ''; // initialize history to an empty string
    // if undefined by calling args then set notes and expire to empty strings
    if (notes === undefined) { notes = ''; }
    if (expire === undefined) { expire = '';  }
    // use a prepared statement for insert
    var stmt = db.prepare('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?)');
    stmt.run(id, title, type, schedule, priority, file, notes, created, expire, history);
    stmt.finalize();
    db.close();
  });
}

// find events by matching parameters
// names = array of parameter names to match
// values = array of values to mach, in order with corisponding names array
// callback = function to pass events found to
exports.find = function (names, values, callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function(events) {}
  }

  // build the WHERE parameters string based on available parameters
  var parameters = '';
  for (n in values) {
    if (global.validMatchParams.indexOf(names[n]) != -1) {
      parameters += ( names[n] + "=?");
      if ( n < (values.length - 1) ) { parameters += ' AND '; }
    }
    else{
      console.error('Invalid Parameter Name: ' + names[n]);
      callback (false);
      return;
    }
  }

  // run db commands in series
  openDB();
  db.serialize(function() {
    // build prepared statement string
    if (parameters != '') {
      var queryString = 'SELECT * FROM events WHERE ' + parameters;
    } else {
      var queryString = 'SELECT * FROM events';
    }
    // create prepared statement
    var query = db.prepare(queryString);

    // get all matching events
    query.all(query, values, function(err, rows) {
      if (err) {
        console.error(err);
        callback (false);
      }else {
        callback (rows);
      }
    });
    query.finalize();
    db.close();
  });
}

// get all events
exports.all = function (callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function() {}
  }

  openDB();
  db.serialize(function() {
    // querry for all events
    db.all('SELECT * FROM events', function(err, rows) {
      if (err) {
        console.error(err);
        callback ('');
      }else {
        callback (rows);
      }
    });
    db.close();
  });
}

// Update events with matching parameters
// names = array of parameter names to match
// values = array of values to mach, in order with corisponding names array
// callback = function to pass modified events
exports.update = function (names, values, updateNames, newValues, callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function(events) {}
  }

  // build the WHERE parameters string based on available parameters
  var parameters = '';
  for (n in values) {
    if (global.validMatchParams.indexOf(names[n]) != -1) {
      parameters += ( names[n] + "=?");
      if ( n < (values.length - 1) ) { parameters += ' AND '; }
    }
    else{
      console.error('Invalid Parameter Name: ' + names[n]);
      callback (false);
      return;
    }
  }

  // build the SET parameters string based on available parameters
  var setParams = '';
  for (n in newValues) {
    if (global.validMatchParams.indexOf(updateNames[n]) != -1) {
      setParams += ( updateNames[n] + "=?");
      if ( n < (newValues.length - 1) ) { setParams += ', '; }
    }
    else{
      console.error('Invalid Parameter Name: ' + updateNames[n]);
      callback (false);
      return;
    }
  }

  var updateValues = newValues.concat(values);

  // run db commands in series
  openDB();
  db.serialize(function() {
    // build SQL prepared statement for update
    var update = db.prepare('UPDATE events SET ' + setParams + ' WHERE ' + parameters);
    // update all matching
    update.all(update, updateValues, function(err, rows) {
      if (err) {
        console.error(err);
        callback (false);
      }else {
        callback (true);
      }
    });
    update.finalize();
    db.close();
  });
}

// delete an event with matching parameters
// find events by matching parameters
// names = array of parameter names to match
// values = array of values to mach, in order with corisponding names array
// callback = function to pass result to
exports.delete = function (names, values, callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function(result) {}
  }

  // build the WHERE parameters string based on available parameters
  var parameters = '';
  for (n in values) {
    if (global.validMatchParams.indexOf(names[n]) != -1) {
      parameters += ( names[n] + "=?");
      if ( n < (values.length - 1) ) { parameters += ' AND '; }
    }
    else{
      console.error('Invalid Parameter Name: ' + names[n]);
      callback (false);
      return;
    }
  }

  // run db commands in series
  openDB();
  db.serialize(function() {
    // build SQL prepared statement
    if (parameters != '') {
      var query = db.prepare('DELETE FROM events WHERE ' + parameters);
    } else {
      var query = db.prepare('DELETE FROM events');
    }
    // delete all matching events
    query.run(query, values, function(err) {
      if (err === null) {
        callback (true);
      }else {
        console.error(err);
        callback (false);
      }
    });
    query.finalize();
    db.close();
  });
}


// print all events (for debugging)
exports.printAll = function () {
  openDB();
  db.serialize(function() {
    // print all events
    db.each('SELECT * FROM events', function(err, row) {
      if (err) {console.log(err);}
      console.log(row.id + ' - ' + row.title + '/' + row.type + ':\n' + row.schedule + ' (' + row.created + ' - ' + row.expire + ') ~ ' + row.file);
      if (row.notes != '') { console.log('Notes: ' + row.notes) } // print any notes on separate line
      if (row.notes != '') { console.log('History: ' + row.history) } // print any notes on separate line
    });
    db.close();
  });
}
