// <-- Automation Process -->
const clever = require('../clever/clever'); // clever script wrapper functions
const events = require('../db/events-db'); // events db functions
var moment = require('moment'); // time manipulation library
var later = require('later'); // scheduler library

// set later to use local time
later.date.localTime();

// list of all events that occur in current period
upcommingEvents = [];

// when loaded upcomig events period expires
periodExpire = new Date();

// last run event
lastEvent = {};

// load events from database and buid liso of ones occuring in the period
// call to update upcommingEvents list and register interval timer for each
function load(period, callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function() {}
  }

  console.log('Reloading Event Que');

  // real all events from db
  events.all(function (rows) {
    // for each event check if it occurs today
    // if so add to todays events list
    rows.forEach(function (item, index) {
      if (exports.checkPeriod(item.schedule, period)) {
        upcommingEvents.push(item);
      }
    });
    callback ();
  });
}

// check if a schedule object has an occurence in the period
function checkPeriod(schedule, period) {
  var sched = later.schedule(later.parse.text(schedule)),
    now = new Date(),
    end = moment().endOf(period).toDate();
  periodExpire = end;
  if (sched.error > 0) {
    console.error('Error parsing schedule char: ' + sched.error + ' in schedule: ' + schedule);
    return false;
  }
  else if (sched.next(1, now, end) != '') { return true;}
  else { return false; }
}

// run current event with highest priority
function run() {
  // list of all events that are scheduled to occur now
  var currentEvents = [];
  var now = new Date();
  // append any event that should occur now to current events
  upcommingEvents.forEach( function (item, index) {
    var schedule = later.parse.text(item.schedule);
    // check if the schedule matches now and the event did not just occur
    if (later.schedule(schedule).isValid(now) && item.id != lastEvent.id) {
      currentEvents.push(item);
    }
  });
  // determine highest priority event
  var runEvent = {};
  var lowestPriority = [100, 100];
  var typePriority = ['show', 'drop', 'playlist'];
  currentEvents.forEach( function (item, index) {
    var eventPriority = [typePriority.indexOf(item.type), item.priority];
    if (eventPriority[0] < lowestPriority[0] && eventPriority[1] < lowestPriority[1]) {
      lowestPriority = eventPriority;
      runEvent = item;
    }
  });

  // execute event determined higest priority
  exeEvent(runEvent);
}

// execute an event
function exeEvent(event) {
  if (event.file != undefined) {
    console.log('Running Event: ' + event.title + ' / ' + event.type);
    // determin type of event and execute acordingly
    switch(event.type) {
      case 'drop':
        // when track ends, load event file with clever
        trackEnd(() => {clever.cleverCmd('loadplay', event.file, function(result) {
          if (result) {
            // when drop is over, call run agian
            trackEnd(run);
            console.log('Event Ran Succesfully');
            lastEvent = event;
          } else {
            console.error('Runnning Event Failed');
          }
        })});
        break;
      case 'playlist':
        // when track ends, load event file with clever
        trackEnd(() => {clever.cleverCmd('loadplay', event.file, function(result) {
          if (result) {
            console.log('Event Ran Succesfully');
            lastEvent = event;
          } else {
            console.error('Runnning Event Failed');
          }
        })});
        break;
      default:
        // load event file with clever
        clever.cleverCmd('loadplay', event.file, function(result) {
          if (result) {
            console.log('Event Ran Succesfully');
            lastEvent = event;
          } else {
            console.error('Runnning Event Failed');
          }
        });
    }
  }
}

// callsback when the current playing track is over
function trackEnd(callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function() {}
  }
  // get time left in track with clever
  clever.cleverCmd('timeleft', undefined, function(result) {
    var timeParts = String(result).split(':');
    var seconds = parseInt(timeParts[0] * 60) + parseInt(timeParts[1]);
    console.log('Waiting ' + seconds + ' seconds for track end')
    setTimeout(callback, (seconds * 1000));
  });
}

// export functions
module.exports.load = load;
module.exports.checkPeriod = checkPeriod;
module.exports.run = run;
module.exports.exeEvent = exeEvent;
module.exports.exeEvent = trackEnd;
