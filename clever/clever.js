const child_process = require('child_process');
const fs =  require("fs");

// wrapper function for the clever script
exports.cleverCmd = function (cmd, arg, callback)  {
  // Process args to clever
  var args = [];
  if (arg != undefined) {
    args = [cmd, arg];
  }else{
    args = [cmd];
  }

  // intialize callback function if undefined
  if (typeof callback != "function") {
    callback = function(out1, out2) {};
  }

  // Define acceptable commands and queries
  var loaders = ["load","loadnew","loadplay"];
  var commands = ["play","pause","playpause","stop","prev","rewind","next","forward","clear","volume","volup","voldn"];
  var queries = ["status","getplpos","swshuffle","swrepeat","getshuffle","getrepeat","position","timeleft","songlength"];

  // Determine if command is a ...
  if (loaders.indexOf(cmd) != -1) { // ...run loader...
    console.log("running clever " + args[0], args[1]);
    // modify path arg relative to contents folder
    //args[1] = "./content/" + args[1];
    // check file exists and has read permisions
    fs.access(args[1], fs.F_OK, (err) => {
      // log error and return if file dosent exist
      if (err) {
        console.error('File ' + args[1] + ' not found!');
        callback('false');
      }
      else {
        // run clever asyncronously and load file
        child_process.spawn("./clever/clever.exe", args);
        callback('true');
      }
    });
  }else if (commands.indexOf(cmd) != -1) { // ...run command...
    // run clever asyncronously, passing result code to the callback
    var child = child_process.spawn("./clever/clever.exe", args);
    child.stderr.on('data', (data) => { callback('false'); });
    child.on('exit', (code) => { callback('true'); });
  }else if (queries.indexOf(cmd) != -1) { // ...run querry..
    // run clever asyncronously, passiing the status code to the callback when complete
    var child = child_process.spawn("./clever/clever.exe", args);
    child.stderr.on('data', (data) => { callback(data); });
    child.stdout.on('data', (data) => { callback(data); });
  }else { // ..or is invalid
    console.error('invalid command: ' + args);
    callback('false');
  }
}

// special volume helper functions
exports.mute = function ()   { return(cleverCmd("volume", "0")); }
exports.volmax = function () { return(cleverCmd("volume", "255")); }

exports.fadeIn = function () {
  for (var i=0; i<=255; i++){ cleverCmd("volup"); }
}

exports.fadeOut = function () {
  for (var i=255; i>=0; i--) { cleverCmd("voldn"); }
}
