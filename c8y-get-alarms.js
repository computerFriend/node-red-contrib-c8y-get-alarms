// Require in libraries
var request = require('request'),
	queryString = require('query-string'),
	utf8 = require('utf8'),
	base64 = require('base-64');

// define constants
// NOTE: not using 'const' bc we want this node to be compatible with early ES versions (<ES6)
var	basePath = '/alarm/alarms'; // this is a constant, dependent on c8y

module.exports = function(RED) {

	function c8yAlarms(n) {
		// Setup node
		RED.nodes.createNode(this, n);
		var node = this;

		this.ret = n.ret || "txt"; // default return type is text
		if (RED.settings.httpRequestTimeout) {
			this.reqTimeout = parseInt(RED.settings.httpRequestTimeout) || 60000;
		} else {
			this.reqTimeout = 60000;
		}

		// 1) Process inputs to Node
		this.on("input", function(msg) {

			var tenant = n.tenant;
			var domain = n.domain; // TODO: get this from settings value in the future

				node.status({
					fill: "blue",
					shape: "dot",
					text: "Fetching alarms..."
				});

				// Build query obj
				var reqQuery = {};

				if (n.pageSize) {
					reqQuery.pageSize = n.pageSize;
				} else {
					reqQuery.pageSize = 10; // TODO: externalize default value
				}

				if (n.type) reqQuery.type = n.type;
				if (n.status) reqQuery.status = n.status;
				if (n.deviceId) reqQuery.source = n.deviceId;

				// Stringify query obj
				var thisQueryString = queryString.stringify(reqQuery);
				var pathAndQuery = basePath + '?' + thisQueryString;

				// Adding auth header // TODO: develop a more secure way to do this
				var encodedCreds;
				if (this.credentials && this.credentials.user) {
					var rawCreds = tenant + '/' + this.credentials.user + ':' + this.credentials.password;
					var byteCreds = utf8.encode(rawCreds);
					encodedCreds = base64.encode(byteCreds);
					// Trim off trailing =
					if (encodedCreds[encodedCreds.length-1]== '=') {
						encodedCreds = encodedCreds.substring(0,encodedCreds.length-2);
					}

				} // else if: TODO: check for creds in settings.js file
				// encodedCreds = value.from.settings
				else {
					msg.error = "Missing credentials";
					msg.statusCode = 403;
					msg.payload = "error: Missing Credentials";
					node.status({
						fill: "red",
						shape: "ring",
						text: "Missing credentials!"
					});
					return node.send(msg);
				}

				var respBody, respStatus;
				var options = {
					url: "https://" + domain + basePath + '?' + thisQueryString,
					headers: {
						'Authorization': 'Basic ' + encodedCreds
					}
				};

				var thisReq = request.get(options, function(err, resp, body) {

					if (err || !resp) {
						var nodeStatusText = "Unexpected error";
						if (err) {
							msg.payload = err.toString();
							msg.statusCode = 499;
							nodeStatusText = 'Error';
						} else if (!resp) {
							msg.statusCode = 500;
							msg.payload = "Server error: No response object";
							nodeStatusText = "Server error";
						}
						node.status({
							fill: "red",
							shape: "ring",
							text: nodeStatusText
						});
						return node.send(msg);
					} else {

						var alarms = JSON.parse(body).alarms;
						msg.payload = alarms;
						msg.statusCode = resp.statusCode || resp.status;
						if (alarms.length < 1) msg.statusCode = 244;
						msg.headers = resp.headers;

						// Error-handling
						if (body.error || resp.statusCode > 299) {
							node.status({
								fill: "red",
								shape: "ring",
								text: JSON.parse(body).message
							});
						}


						// Transform output
						if (node.ret !== "bin") {
							msg.payload = JSON.stringify(alarms).toString('utf8'); // txt

							if (node.ret === "obj") {
								try {
									msg.payload = alarms;
								} catch (e) {
									node.warn(RED._("c8yAlarms.errors.json-error"));
								}
							}
						}
					}

					node.send(msg);
					node.status({});

				});

		}); // end of on.input

	} // end of c8yAlarms fxn

	// Register the Node
	RED.nodes.registerType("c8y-get-alarms", c8yAlarms, {
		credentials: {
			user: {
				type: "text"
			},
			password: {
				type: "password"
			}
		}
	});

};
