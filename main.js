const clever = require('./clever');
const http = require('http');
const url = require('url');

// Create a server
http.createServer( function (request, response) {
   // Parse the request containing file name
   var pathname = url.parse(request.url).pathname;

   if (pathname === "/relay") {
     clever.loadplay("whr-relay1.m3u");
     console.log("playing relay");
     response.writeHead(200, {'Content-Type': 'text/html'});
     // Write the content of the file to response body
     response.write("playing relay");
   }else if (pathname === "/all") {
     clever.loadplay("All.m3u");
     console.log("playing all");
     response.writeHead(200, {'Content-Type': 'text/html'});
     // Write the content of the file to response body
     response.write("playing all");
   }else if (pathname === "/") {
     response.writeHead(200, {'Content-Type': 'text/html'});
     // Write the content of the file to response body
     response.write("root");
   }else{
     // HTTP Status: 404 : NOT FOUND
     // Content Type: text/plain
     response.writeHead(404, {'Content-Type': 'text/html'});
   }
    // Send the response body
    response.end();
}).listen(8081);

console.log('Server running at http://127.0.0.1:8081/');
