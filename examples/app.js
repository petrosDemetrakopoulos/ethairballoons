var http = require('http');
var path = require('path');
var hostname = '127.0.0.1';
var port = 3000;
var ethAirBalloons = require('../lib');
var server = http.createServer(function (req, res) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World');
});

server.listen(port, hostname, function () {
	console.log('Server running at http://' + hostname + ':' + port);
	var savePath = path.resolve(__dirname + '/contracts');
	var ethAirBalloonsProvider = ethAirBalloons('http://localhost:8545', savePath);
	var CarSchema = ethAirBalloonsProvider.createSchema({
		name: "Car",
		contractName: "carsContract",
		properties: [
			{ name: "engine",
				type: "bytes32",
				primaryKey: true
			}
		]
	});

	CarSchema.deploy(function (car, err) {
		if(err){
			console.log(err);
		} else {
			CarSchema.find(function (res,err) {
				if(!err){
					console.log(res);
				}
			});
		}
	});
});