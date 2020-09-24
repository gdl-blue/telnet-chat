const net = require('net');
const readline = require('readline');
const telnet = net.createServer();

var users = [];

function write(msg, excludeServer, excludedClient) {
	if(!excludeServer) console.log(msg);
	for(s of users) {
		if(s == excludedClient) continue;
		try { s.write('\r\n' + msg + '\r\n'); } catch(e) { }
	}
}

telnet.on('connection', async socket => {
	socket.setEncoding('utf8');
	
	users.push(socket);
	
	socket.write('[[Only ASCII characters! No Korean!!!]]\r\n\r\n');
	
	var ip = socket.remoteAddress;
	if(ip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
		ip = ip.replace(/^[:][:]ffff[:]/, '');
	
	write('[[' + ip + ' connected]]\r\n\r\n');
	
	for(s of users) {
		if(s == socket) continue;
		var sip = s.remoteAddress;
		if(sip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
			sip = sip.replace(/^[:][:]ffff[:]/, '');
		s.write('\r\n' + sip + '> ');
	}
	
	async function clientInput() {
		const client = readline.createInterface(socket, socket);
		
		client.question('\r\n' + ip + '> ', msg => {
			write('\r\n' + ip + '> ' + msg, 0, socket);
			
			for(s of users) {
				if(s == socket) continue;
				var sip = s.remoteAddress;
				if(sip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
					sip = sip.replace(/^[:][:]ffff[:]/, '');
				s.write('\r\n' + sip + '> ');
			}
			
			client.close();
			clientInput();
		});
	} clientInput();
});

telnet.on('end', client => {
	var ip = socket.remoteAddress;
	if(ip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
		ip = ip.replace(/^[:][:]ffff[:]/, '');
	
	users.splice(users.indexOf(client), 1);
	
	write('[[' + client.remoteAddress + ' left]]\r\n');
	
	for(s of users) {
		if(s == socket) continue;
		var sip = s.remoteAddress;
		if(sip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
			sip = sip.replace(/^[:][:]ffff[:]/, '');
		s.write('\r\n' + sip + '> ');
	}
});

telnet.listen(23);
