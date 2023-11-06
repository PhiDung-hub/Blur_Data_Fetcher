import { authorize } from '../lib/api/auth.js';
import { server } from './http.js';
import { wss } from './wss.js';

const PORT = 8080;

export function initializeServers() {
  server.on('upgrade', (req, socket, head) => {
    if (!req.url) {
      console.log("Anon blocked");
      return;
    }
    const { localAddress, localPort } = req.socket;

    // Check if the Bearer token is valid
    const isAuthorized = authorize(req);
    if (!isAuthorized) {
      console.log(`\nUnauthorized connection request from IP: ${localAddress}, port ${localPort}\n`);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy(); // Close the socket if the token is not valid.
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log(`\nNew WS connection from IP: ${localAddress}, port ${localPort}\n`);
      wss.emit('connection', ws, req);
    })
  });

  server.listen(PORT, () => {
    console.log(`Http server runnning on port ${PORT}`);
  });
}

