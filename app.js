const binance = require('./lib/binance')
const config = require('./config')
const request = require('request')

binance.options({
	key: config.credentials.key,
	secret: config.credentials.secret,
	recvWindow: 10000
})

let options = {
	symbol: 'ETHBTC',
	type: 'LIMIT',
	quantity: 1,
	price: 0.1,
	timeInForce: 'GTC'
}


binance.buy(options, function(response) {
	console.log(response)
})

/*
binance.balance(function() {
	console.log(response.balances.filter(e => e.asset == 'LTC'))
}) */

binance.status({
	symbol: 'BNBETH'
}, (r) => {console.log(r)}) //11878462
