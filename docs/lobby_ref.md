# F.Lobby Reference

## Project structure
```
config/
	> configuration files
docs/
	> documentation
public/
	> static html files
	examples/
		> example app
	peerjs/
		> libraries for peerjs transport
	ws/
		> library for websocket transport
	lobby.html
		> chat room app
index.js
	> command line interface
lobby.js
	> lobby module
```

## command

start F.Lobby by
```
nodejs index.js [--peerjs] [--public] [--port PORT]
```

### options

#### `--peerjs`
Use the peerjs transport. Use websocket if unspecified.

#### `--public`
Start the lobby in public mode, which means accepting connection from all domains except those in blacklist.

If unspecified, start in private mode, that only connection from whitelisted domains is accepted.

#### `--port`
Listen to a specific port. if `process.env.PORT` is defined, use this value. Otherwise use default value 8001.

### Log
When started, should print three lines of information:
```
public/private server
websocket/peerjs transport
Lobby started at port XXX
```

## lobby module
The module exports two apps

### Lobby
The chat room Express app. Serving static pages under `/public`. And a websocket server for chatting at path `/chat`.

### PeerServer
A websocket server for peer communication.

## Examples
Two example apps are provided, bvb and bvb2. They essentially do the same thing, but bvb is library-less while bvb2 uses the network.js library. One distinction is that bvb has no proper framerate control.
