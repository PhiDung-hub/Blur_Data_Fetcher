import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080/');

ws.on('error', console.error);

ws.on('open', function open() {
  console.log('connected');
  ws.send(Date.now());
});

ws.on('close', function close() {
  console.log('disconnected');
});

ws.on('message', function message(data: number) {
  // TODO: mock client execution here
  console.log(`Received ${data}`);
});
