const http = require('http');
const path = require('path');
const hostname = '127.0.0.1';
const port = 3000;
const ethAirBaloons = require('../lib');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  let savePath = path.resolve(__dirname + '/contracts');
  const ethAirBaloonsProvider = ethAirBaloons('http://localhost:8545', savePath);
   let Car = ethAirBaloonsProvider.createSchema({
	name: "Car",
	contractName: "carsContract",
	properties: [
	{ name: "engine",
	  type: "bytes32",
	  primaryKey: true
	}
	]
});
   Car.deploy(function(contractInstance, error) {
   	if(!error) {
   		console.log('deployed on address: ' + contractInstance.options.address);
   	} else {
   		console.log(error);
   	}
   });
});