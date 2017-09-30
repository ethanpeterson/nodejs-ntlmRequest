
var url = require('url'),
	ntlm = require('./ntlm'),
	http = require('http');

function ntlmRequest(options, callback) {
	let agent = new http.Agent,
		serverurl = url.parse(options.host),
		httpOptions = {
			host: serverurl.hostname,
			port: serverurl.port || 3000,
			path: options.path,
			method: options.method,
			headers: { Accept : options.accept },
			maxRedirects: options.redirects > -1 ? 0 : 10,
			agent: agent
		};
	
	agent.maxSockets = 1; // ntlm authentication doesn't work without this!
	
	const ntdomain = options.domain,
		username = options.username,
		password = options.password,
		endPoint = serverurl.protocol + '//' + httpOptions.host + ':' + httpOptions.port + httpOptions.path;

	let sendAuthenticatedRequest = (data) => {
		// build the type 3 token
		let type3Message = ntlm.type3Message(endPoint, username, password, ntdomain, data);

		// add the authorization token to the request
		httpOptions.headers.Authorization = 'NTLM ' + type3Message;

		// send the request with the authorization token
		let req = http.request(httpOptions, (res) => {
			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				// no need to do anything with this for now
			});

			res.on('end', () => { 
				callback(res);
			});
		});
		
		// send the form data along
		if (options.method === 'POST') {
			req.write(options.formContent);
		}
		
		req.on('error', (err) => {
			console.log('Error: ' + err.message);
		});
		
		req.end();
	};

	let sendNegotiationToken = (data) => { // send type 1 message
		let type1Message = ntlm.type1Message(endPoint, ntdomain);

		httpOptions.headers.Authorization = 'NTLM ' + type1Message;

		let req = http.request(httpOptions, (res) => {
			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				// this should be null as we're expecting a 401 here
			});

			res.on('end', () => { 
				// now lets build our type 3 response and send an authenticated response with the given type 2 token
				sendAuthenticatedRequest(res); 
			});
		});
		
		// initial negotiation the form content should be empty
		if (options.method === 'POST') {
			req.write('');
		}
		
		req.on('error', (err) => {
			console.error('Error: ' + err.message);
		});
		
		req.end();
	};

	let req = http.request(httpOptions, (res) => {
		res.setEncoding('utf8');

		res.on('data', (chunk) => {
			// this should be null as we're expecting a 401 here
		});

		res.on('end', () => { 
			// if we receive a 401 then assume we need to begin the authentication process
			if (res.statusCode === 401) {
				// begin the authentication negotiation process
				sendNegotiationToken(res);
			} else {
				callback(res);
			}
		});
	});
	
	// form data
	if (options.method === 'POST') {
		req.write(options.formContent); // don't expect this to be sent here if NTLM is present
	}

	req.on('error', (err) => {
		console.log('Error: ' + err.message);
	});

	req.end();
}

export default ntlmRequest;