/**
 * ============================================
 * WebSocket Server
 * ============================================
 */

const WebSocket = require("ws");
const logger = require("../utils/logger");

let globalWssInstance = null;

/**
 * Attach handlers to an existing WebSocketServer instance
 */
const setupWebSocket = (wss) => {
  globalWssInstance = wss;

  const clients = new Map();

  wss.on("connection", (ws) => {
    const clientId = Date.now().toString(36);
    clients.set(clientId, { ws, connectedAt: new Date() });

    logger.info(`WebSocket: Client ${clientId} connected (Total: ${clients.size})`);

    ws.send(
      JSON.stringify({
        type: "connected",
        data: {
          clientId,
          message: "Welcome to the WebSocket server!",
          timestamp: new Date().toISOString(),
        },
      }),
    );

    ws.on("message", (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        logger.debug(`WebSocket: Message from ${clientId}:`, message);

        switch (message.type) {
          case "ping":
            ws.send(
              JSON.stringify({
                type: "pong",
                data: { timestamp: new Date().toISOString() },
              }),
            );
            break;

          case "chat":
            broadcast(
              wss,
              {
                type: "chat",
                data: {
                  from: clientId,
                  message: message.data?.message || "",
                  timestamp: new Date().toISOString(),
                },
              },
              ws,
            );
            break;

          case "status":
            ws.send(
              JSON.stringify({
                type: "status",
                data: {
                  connectedClients: clients.size,
                  uptime: process.uptime(),
                  timestamp: new Date().toISOString(),
                },
              }),
            );
            break;

          default:
            ws.send(
              JSON.stringify({
                type: "error",
                data: {
                  message: `Unknown message type: ${message.type}`,
                  validTypes: ["ping", "chat", "status"],
                },
              }),
            );
        }
      } catch {
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid JSON message" },
          }),
        );
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      logger.info(`WebSocket: Client ${clientId} disconnected (Total: ${clients.size})`);
    });

    ws.on("error", (error) => {
      logger.error(`WebSocket: Client ${clientId} error:`, error);
      clients.delete(clientId);
    });
  });

  return wss;
};

const broadcast = (wss, message, excludeWs = null) => {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

const broadcastNotification = (message) => {
  if (!globalWssInstance) return;
  broadcast(globalWssInstance, message);
};

module.exports = { setupWebSocket, broadcastNotification };
