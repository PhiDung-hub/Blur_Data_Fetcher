import WebSocket, { WebSocketServer } from 'ws';

export let isWSSRunning = false;
export let wss: WebSocketServer | null = null;

export function initializeWebSocketServer() {
  wss = new WebSocketServer({ port: 8080 }, () => {
    isWSSRunning = true;
    console.log("Bootstrapping WebSocket Server..");
  });

  wss.on('connection', (ws, req) => {
    ws.on('error', console.error);

    ws.on('message', function message(data, isBinary) {
      console.log('received: %s', data);
      ws.send(`Local Unix Time (seconds): ${Date.now() / 1000}`);
    });
  });
}

export function broadcastData(data: any) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

