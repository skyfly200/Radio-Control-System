const execFile = require('child_process').execFile;

// calls the clever script that controls winamp
var runClever = function (args) {
  const child = execFile("clever", args, function(error, stdout, stderr) {
    return stdout;
  });
}

// wrapper function for the clever scripts commands
exports.cleverCmd = function (cmd, arg)  {
  if (arg != undefined) {
    return(runClever([cmd, arg]));
  }else{
    return(runClever([cmd]));
  }
}

exports.mute = function ()   { return(cleverCmd("volume", "0")); }
volmax = function () { return(cleverCmd("volume", "255")); }


exports.fadeIn = function () {
  for (var i=0; i<=255; i++){ cleverCmd("volup"); }
}

exports.fadeOut = function () {
  for (var i=255; i>=0; i--) { cleverCmd("voldn"); }
}
