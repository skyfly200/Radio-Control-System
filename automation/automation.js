// <-- Automation Process -->
const clever = require('../clever/clever'); // clever script wrapper functions
const events = require('../db/events-db'); // events db functions
var path = require('path'), fs=require('fs'); // Path and file system
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

// set timeout timer waiting to run after current track
waitTimer = null;

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
  runEvent = {};
  dropList = [];
  var lowestPriority = [100, 100];
  var typePriority = ['show', 'drop', 'playlist'];
  currentEvents.forEach( function (item, index) {
    // build list of all current drops
    if (item.type === 'drop') { dropList.push(item); }
    // define priority for events and find the highest(lowest number) priority
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
    // determine type of event and execute acordingly
    switch(event.type) {
      case 'show':
        console.log('Executing Event: ' + event.title + ' / ' + event.type);
        if (waitTimer != null) { clearTimeout(waitTimer); }
        // load event file with clever
        clever.cleverCmd('loadplay', ("./content/" + event.file), function(result) {
          if (result) {
            console.log('Event Ran Succesfully');
            lastEvent = event;
          } else {
            console.error('Runnning Event Failed');
          }
        });
        break;
      case 'drop':
        // only execute if no event timer is running
        if (waitTimer === null) {
          console.log('Executing Event: ' + event.title + ' / ' + event.type);
          var dropPaths = [];
          // que the drops playlist paths, with one random drop from each drop event
          dropList.forEach( function (item, index) {
            // find all mp3 drop files from specified sub folders
            var subFolder = item.file;
            fromDir(("./content/" + subFolder),'mp3', (files) => {
              // select a random file and add it to paths list
              dropPaths[index] = files[getRandomInt(0, files.length)];
            })
          });
          // when track ends, load the empty playlist and fill it with drops
          trackEnd( () => {clever.cleverCmd('loadplay', dropPaths[0], function(result) {
            if (result) {
              // shift the first drop off the list, since its already playing
              dropPaths.shift()
              // build the drops playlist paths, with one random drop from each drop event
              dropPaths.forEach( function (item, index) {
                // add remaining files to the playlist
                clever.cleverCmd('load', dropPaths[index + 1]);
              });
              // when drops playlist ends
              listEnd((dropList.length + 1), () => {
                // call run agian, to load next event
                waitTimer = null;
                console.log('Event Ran Succesfully');
                run();
              });
              lastEvent = event;
            } else {
              console.error('Runnning Event Failed');
            }
          })});
        }
        break;
      case 'playlist':
        // only execute if no event timer is running
        if (waitTimer === null) {
          console.log('Executing Event: ' + event.title + ' / ' + event.type);
          // when track ends, load event file with clever
          clever.cleverCmd('loadplay', ("./content/" + event.file), function(result) {
            waitTimer = null;
            if (result) {
              console.log('Event Ran Succesfully');
              lastEvent = event;
            } else {
              console.error('Runnning Event Failed');
            }
          });
        }
        break;
      default:
        console.log('Executing Event: ' + event.title + ' / ' + event.type);
        if (waitTimer === null) {
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
    var timeMod = -1;
    var seconds = parseInt(timeParts[0] * 60) + parseInt(timeParts[1]) + timeMod;
    console.log('Waiting ' + seconds + ' seconds for track to end')
    waitTimer = setTimeout(callback, (seconds * 1000));
  });
}

// callsback is called after n tracks finish
function listEnd(n, callback) {
  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function() {}
  }
  // if there are still items to wait for in the list
  if (n > 0) {
    // wait for track to end
    trackEnd( () => {
      // call listEnd recusivly on n - 1
      listEnd((n-1), callback);
    });
  } else { // for base case run callback
    callback();
  }
}

// get files of a certian extension from a directory
function fromDir(startPath,filter,callback){

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var matchingFiles = [];
    var files = fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (filename.indexOf(filter)>=0) matchingFiles.push(filename);
    };
    callback(matchingFiles);
};

// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// export functions
module.exports.load = load;
module.exports.checkPeriod = checkPeriod;
module.exports.run = run;
module.exports.exeEvent = exeEvent;
module.exports.exeEvent = trackEnd;
