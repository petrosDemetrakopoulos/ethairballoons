# EthAir Balloons
<img src="logo_official.png" width="300">
A strictly typed ORM library for Ethereum blockchain.
It allows you to use Ethereum blockchain as a persistent storage in an organized and model-oriented way <strong>without writing custom complex Smart contracts</strong>.


<strong>Note:
As transaction fees may be huge, it is strongly advised to only deploy EthAir Balloons models in private Ethereum blockchains or locally using
`ganache-cli` .
</strong>


# Installation
```
npm i --save ethAirBalloons
```

# Setup and example

```
var ethAirBalloons = require('ethAirBallons');
var savePath = path.resolve(__dirname + '/contracts');
var ethAirBalloonsProvider = ethAirBalloons('http://localhost:8545', savePath); //ethereum blockchain provider URL, path to save auto generated smart contracts

var CarSchema = ethAirBalloonsProvider.createSchema({
		name: "Car",
		contractName: "carsContract",
		properties: [
		    {   name: "model",
				type: "bytes32",
				isPrimaryKey: true
			},
			{ 
			    name: "engine",
			    type: "bytes32",
			},
			{   name: "cylinders",
				type: "uint"
			}
		]
	});

```

As you can see you can very easily create a new ethAirbaloons provider by setting only 2 arguments.
The fist one is the URL of the Ethereum blockchain provider that you want to use (in the example it is set to a local `ganache-cli` provider),
and the second one is the path where you want to save the automatically generated smart contracts of your models.
