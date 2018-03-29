# nodejs-ntlmRequest

I created this code to help with testing my NodeJS projects that authenticate with NTLM. Basically, 
the ntlmRequest() function performs the authentication request on behalf of the testing client, mocha in this case, making the authorization round trip per the NTLM authentication protocol. 

I was looking for a simple way to run through a BDD test for an NTLM authenticated nodejs site and I found [andypols](https://gist.github.com/andypols) code. The NTLM crypto code used here can be found at https://gist.github.com/andypols/5513270 and is completely credited to [andypols](https://gist.github.com/andypols). I simply wrapped it up into some code that will send the authentication request in a way that can be used for BDD testing. 

## Dependencies

### Required
[ntlm.js](https://gist.github.com/andypols/5513270)

### Not Required, but helps in testing
[mocha](https://github.com/mochajs/mocha)

[chai](https://github.com/chaijs/chai)

## Usage

```js
var chai = require('chai'),
	server = require('../server'),
	expect = chai.expect,
	ntlmRequest = require('../nodejs-ntlmRequest');

describe ('Test requesting http resource', () => {
	it ('should get the resource', (done) => {
		let options = {
			host: 'http://localhost:3000',
			path: '/',
			method: 'GET',
			accept: 'application/json',
			redirects: 0,
			domain: 'CORP',
			username: 'joe',
			password: 'domainpassword'
		};

		ntlmRequest(options, (res) => {
			expect(res).to.have.header('content-type', 'application/json; charset=utf-8');

			done();
		})
	});
});
```

## Author

[ethanpeterson](https://github.com/ethanpeterson)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.md) file for more info.

Copyright (c) 2017