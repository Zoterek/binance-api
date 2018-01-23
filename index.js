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
	/*** General ***/
	info: function(callback) {
		let url = '/api/v1/exchangeInfo'

		basicRequest(url, undefined, callback)
	},
	ping: function(callback) {
		let url = '/api/v1/ping'

		basicRequest(url, undefined, callback)
	},
	time: function(callback) {
		let url = '/api/v1/time'

		basicRequest(url, undefined, callback)
	},
	/*** Market ***/
	depth: function(options, callback) {
		let url = '/api/v1/depth'

		basicRequest(url, options, callback)
	},
	historicalTrades: function(options, callback) {
		let url = '/api/v1/historicalTrades'

		basicRequest(url, options, callback)
	},
	trades: function(options, callback) {
		let url = '/api/v1/trades'

		basicRequest(url, options, callback)
	},
	/*** Signed ***/
	account: function(callback) {
		let url = '/api/v3/account'

		signedRequest(url, undefined, callback)
	},
	allOrders: function(options,callback) {
		let url = '/api/v3/allOrders'

		signedRequest(url, options, callback)
	},
	buy: function(options = {}, callback) {
		options.side = 'BUY'
		order(options, callback)
	},
	cancel: function(options, callback) {
		let url = '/api/v3/order'

		signedRequest(url, options, callback, 'DELETE')
	},
	openOrders: function(options,callback) {
		let url = '/api/v3/openOrders'

		signedRequest(url, options, callback)
	},
	myTrades: function(options,callback) {
		let url = '/api/v3/myTrades'

		signedRequest(url, options, callback)
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

function basicRequest(url, params = {}, callback) {
	let options = {
		url: url,
		baseUrl: config.baseUrl,
		qs: Object.assign(params)
	}

	request(options, function(error, response, body) {
		if(error) callback(error)
		if(callback) {
			try {
				callback(null, JSON.parse(body))
			} catch(err) {
				callback(null, {code: 1, msg: 'Parsing error: ' + err.message})
			}
		}
	})
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

	request(options, function(error, response, body) {
		if(error) callback(error)
		if(callback) {
			try {
				callback(null, JSON.parse(body))
			} catch(err) {
				callback(null, {code: 1, msg: 'Parsing error: ' + err.message})
			}
		}
	})
}

function order(params, callback) {
	let url = '/api/v3/order/test'

	if(!params.type) return callback({code: -1102, msg: 'Param \'type\' must be sent'})
	if(!params.quantity) return callback({code: -1102, msg: 'Param \'quantity\' must be sent'})

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
