import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 8080
});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    // TODO: define execution API here
    console.log('received: %s', data);
    ws.send(Date.now());
  });

  // ws.send(Date.now());
})
