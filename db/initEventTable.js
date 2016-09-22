var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('events');

db.serialize(function() {
  db.run('CREATE TABLE events (title TEXT, type TEXT, date TEXT, time TEXT, priority INT, file TEXT, notes TEXT)');
});

db.close();
