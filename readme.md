# F.Lobby
A minimalistic PvP game server for your needs

## Well defined architecture

The three roles, __game__, __chatroom__ and __transport__ are clearly defined and separable in our design. You provide the game, customize the chatroom, and choose between WebSocket or PeerJS transport.

## Getting started
```
npm install
nodejs index.js --port 8001
```
Open two windows in `http://localhost:8001/examples/bvb.html` and try.

## Demo
http://lobby.projectf.hk/examples/bvb_both.html

## More
Read the [docs](docs).
