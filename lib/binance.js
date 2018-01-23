const crypto = require('crypto')
const request = require('request')

let config = {
	baseUrl: 'https://api.binance.com',
	recvWindow: 5000
}

module.exports = {
	options: function(opt) {
		config.key = opt.key
		config.secret = opt.secret
		if(opt.recvWindow) config.recvWindow = opt.recvWindow
	},
	balance: function(callback) {
		let url = '/api/v3/account'

		signedRequest(url, undefined, callback)
	},
	buy: function(options = {}, callback) {
		options.side = 'BUY'
		order(options, callback)
	},
	list: function(symbol,callback) {
		let url = '/api/v3/openOrders'

		signedRequest(url, {symbol: symbol}, callback)
	},
	ping: function() {
		let url = config.baseUrl + '/api/v1/ping'

		// todo
		request(url, function(err, response, body) {
			console.log(body)
		})
	},
	sell: function(options = {}, callback) {
		options.side = 'SELL'
		order(options, callback)
	},
	status: function(options, callback) {
		let url = '/api/v3/order'

		signedRequest(url, options, callback)
	}
}

function signedRequest(url, params = {}, callback, method = 'GET') {
	if(!config.secret) throw new Error('Invalid API Secret')
	if(!config.key) throw new Error('Invalid API Key')
	
	let options = {
		url: url,
		baseUrl: config.baseUrl,
		headers: {
			'X-MBX-APIKEY': config.key
		},
		method: method,
		qs: Object.assign(params, {
			recvWindow: config.recvWindow,
			timestamp: Date.now()
		})
	}
	options.qs.signature = sign(options.qs)

	request(options, function(err, response, body) {
		if(!response || !body) throw 'signedRequest: ' + err;
		if(callback) {
			try {
				callback(JSON.parse(body))
			} catch(err) {
				console.error('Parsing error: ' + err.message)
			}
		}
	})
}

function order(params, callback) {
	let url = '/api/v3/order/test'

	if(!params.type) throw new Error('Invalid or missing order type')
	if(!params.quantity) throw new Error('Invalid or missing quantity')

	signedRequest(url, params, callback, 'POST')
}

function sign(params) {
	let qs = Object.keys(params).reduce((a, c) => {
			a.push(c + '=' + encodeURIComponent(params[c]))
			return a
		}, []).join('&')
	return crypto.createHmac('sha256', config.secret)
		.update(qs)
		.digest('hex')
}
