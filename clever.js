const child_process = require('child_process');

// wrapper function for the clever script
exports.cleverCmd = function (cmd, arg)  {
  var args = [];
  if (arg != undefined) {
    args = [cmd, arg];
  }else{
    args = [cmd];
  }
  var commands = ["play","pause","playpause","stop","prev","rewind","next","forward","clear","load","loadnew","loadplay","volume","volup","voldn"];
  var queries = ["status","getplpos","swshuffle","swrepeat","getshuffle","getrepeat","position","timeleft","songlength"];
  if (commands.indexOf(cmd) != -1) { // run command
    child_process.execFile("clever", args, function (error, stdout, stderr) {
      console.log(stdout);
    });
    if (arg === undefined) { arg = ""; }
    return "running clever " + cmd + " " + arg;
  }else if (queries.indexOf(cmd) != -1) { // run querry
    var returnObject = child_process.spawnSync("clever", args);
    console.log(returnObject.stdout);
    return returnObject.stdout;
  }else { // not valid
    return "invalid command";
  }
}

// special volume functions
exports.mute = function ()   { return(cleverCmd("volume", "0")); }
exports.volmax = function () { return(cleverCmd("volume", "255")); }

exports.fadeIn = function () {
  for (var i=0; i<=255; i++){ cleverCmd("volup"); }
}

exports.fadeOut = function () {
  for (var i=255; i>=0; i--) { cleverCmd("voldn"); }
}
