var express = require('express');
var WebSocketServer = require('ws').Server;
var bodyParser = require('body-parser');
var cors = require('cors');
var whitelist = require('./config/whitelist.json');
var blacklist = require('./config/blacklist.json');

module.exports.Lobby=function(http, config)
{

var app = express();
var rooms = {};

app.use(cors());
app.use('/', express.static(__dirname + '/public'));

app.get('/lobby', function(req, res) {
	res.sendFile(__dirname + '/public/lobby.html');
});

app.get('/protocol', function(req, res) {
	config.protocol.address = req.protocol+'://'+req.headers.host;
	res.send(JSON.stringify(config.protocol));
});

app.post('/login', bodyParser.json(), function(req, res) {
	var name = req.body.name;
	var room = req.body.room;
	var origin = req.body.origin;

	if( !name) {
		res.send(JSON.stringify({
			success: false,
			mess: 'Invalid name.'
		}));
		return;
	}
	if( !room) {
		res.send(JSON.stringify({
			success: false,
			mess: 'Invalid room.'
		}));
		return;
	}
	if( !origin) {
		res.send(JSON.stringify({
			success: false,
			mess: 'Invalid origin.'
		}));
		return;
	}

	if( config.public) {
		if( blacklist[origin]) {
			res.send(JSON.stringify({
				success: false,
				mess: 'Origin '+origin+' in server blacklist.'
			}));
			return;
		}
	}
	else {
		if( !whitelist[origin]) {
			res.send(JSON.stringify({
				success: false,
				mess: 'Origin '+origin+' not in server whitelist.'
			}));
			return;
		}
	}

	if( !rooms[room]) {
		rooms[room] = {};
		console.log('Room '+room+' created.');
	}

	if( !rooms[room][name]) {
		rooms[room][name] = 'loggedin';
		res.send(JSON.stringify({
			success: true
		}));
	}
	else {
		res.send(JSON.stringify({
			success: false,
			mess: 'Name '+name+' is taken. Please choose another one.'
		}));
	}
});

app.on('mount', function() {
	var wsschat = new WebSocketServer({server:http, path:'/chat'});
	wsschat.on('connection', function(ws) {
		var name, room;
		ws.on('message', function(json) {
			try {
				var data = JSON.parse(json);
				if( data.mess==='logged in.' && rooms[data.room][data.name]==='loggedin') {
					name = data.name;
					room = data.room;
					rooms[room][name] = ws;
					console.log('Client '+name+' connected.');
				}
				if( data.target==='all') {
					for( var I in rooms[room])
						rooms[room][I].send(json);
				} else {
					rooms[room][data.target].send(json);
				}
			} catch (e) {
				console.log(e);
				ws.close();
			}
		});
		ws.on('close', function() {
			console.log('Client '+name+' disconnected');
			delete rooms[room][name];
		});
	});
});

return app;
}

module.exports.PeerServer=function(http, path)
{
var peers = {},
	wsspeer = new WebSocketServer({server:http, path:path});

wsspeer.on('connection', function(ws) {
	var name, peer;
	ws.on('message', function(json) {
		var data = JSON.parse(json);
		if( data.open) {
			if( !peers[data.name]) {
				name = data.name;
				peer = {ws:ws};
				peers[name] = peer;
				console.log('Peer '+name+' connected.');
			} else {
				ws.close();
			}
		}
		if( peer && data.target) {
			peer.target = data.target;
		}
		if( peer && peer.target && peers[peer.target]) {
			peers[peer.target].ws.send(json);
		}
	});

	ws.on('close', function() {
		if( peer && peer.target && peers[peer.target]) {
			peers[peer.target].ws.close();
		}
		console.log('Peer '+name+' disconnected');
		peer = {};
		delete peers[name];
	});
});

return http;
}
