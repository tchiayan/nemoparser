var http = require('http')
var fs = require('fs');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    var file = fs.createReadStream('./dist/index.html');
    file.pipe(res);
}).listen(8080); //the server object listens on port 8080