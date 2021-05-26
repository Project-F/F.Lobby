# F.Lobby
A minimalistic PvP game server for your needs

## Well defined architecture

The three roles, __game__, __chatroom__ and __transport__ are clearly defined and separable in our design. You provide the game, customize the chatroom, and choose between WebSocket or [PeerJS](http://peerjs.com/) transport.

## Getting started
```
nodejs index.js
```
Open two windows in `http://localhost:8001/examples/bvb2.html` and try. [Demo Video](https://www.youtube.com/watch?v=pdIfLtkQWZ0&lc=z23xjrmijmypjvrhn04t1aokg2ijhnzqqqpgzxzvdsy2rk0h00410).

![](docs/cap.png)

## More
Read the [tutorial](docs/tutorial.md) and [docs](docs).

## License
Copyright 2015. The Project F developers

[MIT](http://opensource.org/licenses/MIT)
