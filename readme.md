# F.Lobby
A minimalistic PvP game server for your needs

## Well defined architecture

The three roles, __game__, __chatroom__ and __transport__ are clearly defined and separable in our design. You provide the game, customize the chatroom, and choose between WebSocket or [PeerJS](http://peerjs.com/) transport.

## Getting started
```
nodejs index.js
```
Open two windows in `http://localhost:8001/examples/bvb2.html` or our hosted [demo](http://lobby.projectf.hk/examples/bvb2.html) and try.

![](docs/cap.png)

## More
Read the [tutorial](docs/tutorial.md) and [docs]().
