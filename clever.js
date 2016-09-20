const child_process = require('child_process');

// wrapper function for the clever script
exports.cleverCmd = function (cmd, arg)  {
  var args = [];
  if (arg != undefined) {
    args = [cmd, arg];
  }else{
    args = [cmd];
  }
  child_process.execFile("clever", args, (error, stdout, stderr) => {
    console.log(stdout);
  });
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
