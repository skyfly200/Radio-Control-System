const execFile = require('child_process').execFile;

var clever = function (args) {
  const child = execFile("clever", args, function(error, stdout, stderr) {
    return stdout;
  });
}

// wrapper functions for the clever scripts commands
exports.playpause = function ()  {return(clever(["playpause"]));}
exports.play = function ()       {return(clever(["play"]));}
exports.pause = function ()      {return(clever(["pause"]));}
exports.stop = function ()       {return(clever(["stop"]));}
exports.prev = function ()       {return(clever(["prev"]));}
exports.next = function ()       {return(clever(["next"]));}
exports.rewind = function ()     {return(clever(["rewind"]));}
exports.forward = function ()    {return(clever(["forward"]));}
exports.volUp = function ()      {return(clever(["volUp"]));}
exports.volDown = function ()    {return(clever(["volDown"]));}
exports.clear = function ()      {return(clever(["clear"]));}
exports.status = function ()     {return(clever(["status"]));}
exports.getplpos = function ()   {return(clever(["getplpos"]));}
exports.getshuffle = function () {return(clever(["getshuffle"]));}
exports.swshuffle = function ()  {return(clever(["swshuffle"]));}
exports.getrepeat = function ()  {return(clever(["getrepeat"]));}
exports.swrepeat = function ()   {return(clever(["swrepeat"]));}
exports.position = function ()   {return(clever(["position"]));}
exports.timeleft = function ()   {return(clever(["timeleft"]));}
exports.length = function ()     {return(clever(["songlength"]));}

exports.loadfile = function (file) {return(clever(["load", file]));}
exports.loadnew  = function (file) {return(clever(["loadnew", file]));}
exports.loadplay = function (file) {return(clever(["loadplay", file]));}
exports.volume   = function (level) {return(clever(["volume", level]));}

exports.mute = function ()   {return(volume(0));}
volmax = function () {return(volume(255));}


exports.fadeIn = function () {
  for (var i=0; i<=255; i++){volUp();}
}

exports.fadeOut = function () {
  for (var i=255; i>=0; i--){volDown();}
}
