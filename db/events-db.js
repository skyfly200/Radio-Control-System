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

// delete an event
exports.delete = function (title) {
  db.serialize(function() {
    // use a prepared statement for delete
    var stmt = db.prepare('DELETE FROM events WHERE title = ?');
    stmt.run(title);
    stmt.finalize();
  });
}


// find and return an event
exports.find = function (title, callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function() {}
  }

  db.serialize(function() {
    // print all events
    db.each('SELECT * FROM events WHERE title = ?', title, function(err, row) { // fix with statment
      if (err) {console.error(err);}
      callback (row);
    });
  });
}

// return all events
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
