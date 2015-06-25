var express = require('express');
var app = express();
var Lobby = require('./lobby').Lobby;
var http = require('http').createServer(app);
var opts = require('optimist')
	.usage('Usage: $0')
	.options({
		peerjs: {
			demand: false,
			description: 'Use peerjs transport',
			default: false
		},
		public: {
			demand: false,
			description: 'Start a public lobby (dangerous!)',
			default: false
		},
		port: {
			demand: false,
			default: null
		}
	})
	.argv;

var port = Number(opts.port || process.env.PORT || 8001);

var lobby_config = {
	public: opts.public,
	protocol: null
};

if( opts.public)
	console.log('public server');
else
	console.log('private server');

if( opts.peerjs)
{
	var PeerServer = require('peer').ExpressPeerServer;
	var path = '/peerjs';
	lobby_config.protocol = {
		name:'F.Lobby (p)',
		library:'/peerjs/network.js',
		port:port,
		path:path
	};
	app.use(path, PeerServer(http, {debug:true}));
	console.log('PeerJS transport');
}
else
{
	var PeerServer = require('./lobby').PeerServer;
	var path = '/peer';
	lobby_config.protocol = {
		name:'F.Lobby (ws)',
		library:'/ws/network.js',
		port:port,
		path:path
	};
	PeerServer(http, path);
	console.log('websocket transport');
}

app.use('/', Lobby(http, lobby_config));
http.listen(port);
console.log('Lobby started at port '+port);
