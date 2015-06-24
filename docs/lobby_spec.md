# F.Lobby Specification

This document outline the design of an application agnostic, multi-transport Player-vs-Player (PvP) game server.

## Version

F.Lobby 0.1 // May 2015 // First draft.

## Preface

### Terminologies

#### Player-vs-Player (PvP) game

A HTML5 application (likely a game) involving two clients that synchronizes their states via internet protocols.

#### Application agnostic

The server provides services to applications via a specified interface. Such applications can be published by third-party and hosted on a different domain.

#### Multiple transport

The server supports multiple internet protocols (WebSocket and WebRTC), but is completely transparent to applications.

### Scenario

Chris developed and published a HTML5 arcade game. The game has considerable initial success, and Chris now wants to add PvP functionality to the game. He wants a game server with a mini chatroom for players to social and pair up. But he does not want to develop and setup his own server. He can use F.Lobby. He can host F.Lobby on the cloud with ease, or even use services provided by F.Lobby service providers.

## Architecture

### Server provided components

The server provides two components, a lobby application and a peer communication programming library.

#### Lobby

The chat room application is intended to be embedded into host application via `iframe`. The chat room allows players to chat and pair up. When a pair of players decided to start a match, the lobby app will send a message to the host app. The host app can then use this information to establish a PvP channel and starts the game.

#### Communication library

The communication library provides the essential networking functionalities through a simple API, which abstracts the underlying transport protocol. Support libraries will also be provided by F.Lobby for richer functionalities, but that should remain a client side thing.

## Interface specification

### Protocol

The server returns a JSON object with info for setting up the communication library.
```
GET /protocol
```
Return
```
var server=
{
	"name":     "Server Name",
	"library":  "path/to/lib.js",
	... //extra fields to be passed to setup
}
```

### Lobby

The lobby app is serverd at `/lobby`. When the lobby app is loaded, a cross window message should be sent to it for handshake.
```
{
	"init":     true,
	"protocol": "F.Lobby 0.1",
	"room":     "room name. should be your game's unique name"
}
```
The lobby will then join the specified chat room on server. Only players in the same room can see each other.

For example,
```
<iframe id='lobby'></iframe>
<script>
var lobby = document.getElementById('lobby');
var request = new XMLHttpRequest();
var server;
request.onload = function()
{
	server = JSON.parse(this.responseText);
	//create iframe
	lobby.src = server_address+'/lobby';
	lobby.onload = function()
	{
		//initializes lobby
		lobby.contentWindow.postMessage({
			init: true,
			protocol: 'F.Lobby 0.1',
			room: 'room_for_demo'
		}, server_address);
	}
}
request.open('GET', server_address+'/protocol', true);
request.responseType = 'text';
request.send();
</script>
```

The host app should then listen to game start message from lobby:
```
var param=
{
	"event": "start",
	... //extra fields to be passed to setup
}
```

For example,
```
window.addEventListener('message', windowMessage, false);
function windowMessage(event)
{
	if( event.origin===server_address)
	if( event.data.event==='start')
	{
		setup(event.data);
	}
}
```

### Library setup

The `server` and `param` objects obtained from previous is used to setup the communication library.
The communication library should be loaded at `server.address+server.library` using requirejs or other compatible module systems.
Then, the `setup` function should be called, with a config object:
```
{
	"server": { object obtained from /protocol },
	"param":  { object obtained from game start message }
}
```
and an event handler.

For example,
```
function setup(param)
{
	requirejs([server.address+server.library],function(transport)
	{
		transport.setup({
			server:server,
			param:param
		}, handler);
	});
}
```

### Event handler

Immediately after calling setup, it will attempt to establish a connection to the other peer. It will callback the handler when success.
The handler should be an object with a method `on` that is responsible for all communication.

When call, the `on` method will be given two parameters, `event` and `data`. `data` has different meanings depending on the event:

#### open
data is a sender object which has a method `send` that accepts a JSON serializable message object, and will send it to the peer.

#### close
connection closed. data _may_ indicate reason. at this point the communication channel is closed and is not reopenable.

#### log
data: log message

#### error
data: error message

#### data
data: data sent from the other side

For example,
```
var sender;
var handler=
{
	on:function(event, data)
	{
		switch (event)
		{
			case 'open':
				//channel established
				sender = data;
				//which can be used to send message to peer
				sender.send({mess:'hello'});
			break;
			case 'close':
				//connection closed
			break;
			case 'log':
				console.log(data);
			break;
			case 'error':
				console.error(data);
			break;
			case 'data':
				//received data from peer
				process(data);
			break;
		}
	}
};
```

## Notes

All examples stated should be for reference only.
