const sqlite3 = require('sqlite3').verbose();
var db;

// open the database
exports.open = function () {
  db = new sqlite3.Database('./db/events');
}

// close the database
exports.close = function () {
  db.close();
}

// register a new event
exports.register = function (title, type, date, time, priority, file, notes) {
  db.serialize(function() {
    // use a prepared statement for insert
    var stmt = db.prepare('INSERT INTO events VALUES (?,?,?,?,?,?,?)');
    stmt.run(title, type, date, time, priority, file, notes);
    stmt.finalize();
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
  var validParams = ['title', 'type', 'date', 'time', 'priority', 'file'];
  var parameters = '';
  for (n in values) {
    if (validParams.indexOf(names[n]) != -1) {
      parameters += ( names[n] + "=?");
      if ( n < (values.length - 1) ) { parameters += ' AND '; }
    }
    else{
      console.error('Invalid Parameter Name: ' + names[n]);
      callback (false);
      return;
    }
  }

  // build SQL query
  var query = 'DELETE FROM events WHERE ' + parameters;

  // run db commands in series
  db.serialize(function() {
    // delete all events
    db.run(query, values, function(err) {
      if (err === null) {
        callback (true);
      }else {
        console.error(err);
        callback (false);
      }
    });
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
  var validParams = ['title', 'type', 'date', 'time', 'priority', 'file', 'notes'];
  var parameters = '';
  for (n in values) {
    if (validParams.indexOf(names[n]) != -1) {
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
  var validParams = ['title', 'type', 'date', 'time', 'priority', 'file', 'notes'];
  var setParams = '';
  for (n in newValues) {
    if (validParams.indexOf(updateNames[n]) != -1) {
      setParams += ( updateNames[n] + "=?");
      if ( n < (newValues.length - 1) ) { setParams += ', '; }
    }
    else{
      console.error('Invalid Parameter Name: ' + updateNames[n]);
      callback (false);
      return;
    }
  }

  // build SQL update and query staments
  // (CHANGE TO USING PREPARED STATEMENTS!!!!!!)
  var update = 'UPDATE events SET ' + setParams + ' WHERE ' + parameters;
  console.log(update);

  var updateValues = newValues.concat(values);

  // run db commands in series
  db.serialize(function() {
    // update all matching
    db.all(update, updateValues, function(err, rows) {
      if (err) {
        console.error(err);
        callback (false);
      }else {
        callback (true);
      }
    });
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
  var validParams = ['title', 'type', 'date', 'time', 'priority', 'file'];
  var parameters = '';
  for (n in values) {
    if (validParams.indexOf(names[n]) != -1) {
      parameters += ( names[n] + "=?");
      if ( n < (values.length - 1) ) { parameters += ' AND '; }
    }
    else{
      console.error('Invalid Parameter Name: ' + names[n]);
      callback (false);
      return;
    }
  }

  // build SQL query
  var query = 'SELECT * FROM events WHERE ' + parameters;

  // run db commands in series
  db.serialize(function() {
    // print all events
    db.all(query, values, function(err, rows) {
      if (err) {
        console.error(err);
        callback (false);
      }else {
        callback (rows);
      }
    });
  });
}

// get all events
exports.all = function (callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function() {}
  }

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
  });
}

// print all events (for debugging)
exports.printAll = function () {
  db.serialize(function() {
    // print all events
    db.each('SELECT * FROM events', function(err, row) {
      if (err) {console.log(err);}
      console.log(row.title + '/' + row.type + ' - ' + row.date + ' ' + row.time + ' - ' + row.file);
      if (row.notes != '') { console.log('Notes: ' + row.notes) } // print any notes on separate line
    });
  });
}

// delete all events  BE CAREFUL! this function DELETEs all events!!!
exports.deleteAll = function (title) {
  db.serialize(function() {
    // delete all events
    db.run('DELETE FROM events');
  });
}
