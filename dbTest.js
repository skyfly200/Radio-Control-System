const events = require('./db/events-db');

// test db functions
events.open();
//events.register('Test Show', 'show', '12/31/99', '00:00-24:00', '0', 'test.m3u', 'test');
//events.deleteAll();
//events.printAll();
//console.log("All Events:");
//events.all( function(events) {
//  console.log(events);
//});
//events.find(['title', 'type', 'priority'], ['Test Show', 'show', '0'], function(event) {
//  console.log(event);
//});
events.update(['title', 'type', 'priority'], ['Test Show', 'show', '1'], ['priority'], ['0'], function(event) {
  console.log(event);
});
//events.delete(['title'], ['Test Show'], function(error) {
//  console.log(error === undefined);
//});
events.close();
