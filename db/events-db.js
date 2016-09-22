const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/events');

// register a new event
exports.register = function (title) {
  db.serialize(function() {
    // use a prepared statement for insert
    var stmt = db.prepare('INSERT INTO events VALUES (?,?,?,?,?,?,?)');
    stmt.run(title, type, date, time, priority, file, notes);
    stmt.finalize();
  });
  db.close();
}

// delete an event
exports.delete = function (title, type, date, time, priority, file, notes) {
  db.serialize(function() {
    // use a prepared statement for insert
    var stmt = db.prepare('DELETE FROM events WHERE title=(?)');
    stmt.run(title);
    stmt.finalize();
  });
  db.close();
}

// print all events (for debugging)
exports.find = function (title) {
  // print all events
  db.each('SELECT * FROM events WHERE', function(err, row) {
    if (err) {console.log}
    console.log(row.id + ': ' + row.title + ' ' + row.type + ' ' + row.date + ' ' + row.time + ' ' + row.file);
  });
}

// print all events (for debugging)
exports.all = function () {
  // print all events
  db.each('SELECT * rowid AS id FROM events', function(err, row) {
    if (err) {console.log}
    console.log(row.id + ': ' + row.title + ' ' + row.type + ' ' + row.date + ' ' + row.time + ' ' + row.file);
  });
}
