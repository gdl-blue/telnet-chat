const net = require('net');
const readline = require('readline');
const telnet = net.createServer();

const pw = '19830422';

var users = [];

function write(msg, excludeServer, excludedClient) {
	if(!excludeServer) console.log(msg);
	for(s of users) {
		if(s == excludedClient) continue;
		try { s.write('\r\n' + msg + '\r\n'); } catch(e) { }
	}
}

telnet.on('connection', socket => {
	socket.setEncoding('utf8');
	
	const client = readline.createInterface(socket, socket);
	client.question('접속 비밀번호: ', inputpw => {
		if(pw && !inputpw.endsWith(pw)) {
			socket.write('비밀번호가 틀렸읍니다. 다시 접속해주세요.');
			socket.destroy();
		} else {
			users.push(socket);
	
			var ip = socket.remoteAddress;
			if(ip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
				ip = ip.replace(/^[:][:]ffff[:]/, '');
			
			if(ip.includes(':')) {
				socket.write('IPv6은 지원되지 않습니다.');
				socket.destroy();
				return;
			}
			
			ip = ip.replace(/[.]\d{1,3}[.]\d{1,3}$/, '.**.**');
			
			write('[[' + ip + '가 접속했습니다]]\r\n\r\n', 0, socket);
			
			socket.write('[[' + ip + '님, 환영합니다]]\r\n');
			
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
		}
	});
});

telnet.on('end', client => {
	var ip = socket.remoteAddress;
	if(ip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
		ip = ip.replace(/^[:][:]ffff[:]/, '');
	
	users.splice(users.indexOf(client), 1);
	
	write('[[' + client.remoteAddress + '가 서버에서 나갔읍니다]]\r\n');
	
	for(s of users) {
		if(s == socket) continue;
		var sip = s.remoteAddress;
		if(sip.match(/^[:][:]ffff[:]\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/))
			sip = sip.replace(/^[:][:]ffff[:]/, '');
		s.write('\r\n' + sip + '> ');
	}
});

telnet.listen(23);
