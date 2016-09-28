// initalize database tables
const sqlite3 = require('sqlite3').verbose();
db = new sqlite3.Database('./configDB');

db.run('CREATE TABLE events (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, type TEXT NOT NULL, schedule TEXT, priority INT CHECK(priority>=0), file TEXT, notes TEXT, created TEXT, expire TEXT, history TEXT)', function(error) {
  if (error) { console.error(error); }
});
