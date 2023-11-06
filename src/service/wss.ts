import WebSocket, { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const { localAddress, localPort } = req.socket;
    console.log(`received: ${data} from IP: ${localAddress}, port ${localPort}`);

    ws.send(`Server Local Unix Time (seconds): ${Date.now() / 1000}`);
  });
});

export function wsBroadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
