/**
 * ============================================
 * WebSocket Server
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - WebSockets provide real-time, bidirectional communication
 * - Unlike HTTP (request/response), WebSockets stay connected
 * - Great for: chat, live notifications, real-time dashboards
 * - We use the `ws` library (lightweight, no abstraction overhead)
 *
 * How it works:
 *   1. Client opens a WebSocket connection: ws://localhost:4000
 *   2. Server and client can send messages at any time
 *   3. The connection stays open until either side closes it
 *
 * Message format (JSON):
 *   { "type": "chat", "data": { "message": "Hello!" } }
 *
 * Try it:
 *   - Open browser console
 *   - const ws = new WebSocket('ws://localhost:4000')
 *   - ws.onmessage = (e) => console.log(JSON.parse(e.data))
 *   - ws.send(JSON.stringify({ type: 'chat', data: { message: 'Hi!' } }))
 */

const WebSocket = require("ws");
const logger = require("../utils/logger");

let globalWssInstance = null;

/**
 * Set up WebSocket server on the existing HTTP server
 */
const setupWebSocket = (wss) => {
  globalWssInstance = wss;

  // Track connected clients
  const clients = new Map();

  wss.on("connection", (ws, req) => {
    const clientId = Date.now().toString(36);
    clients.set(clientId, { ws, connectedAt: new Date() });

    logger.info(
      `WebSocket: Client ${clientId} connected (Total: ${clients.size})`,
    );

    // Send welcome message
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

    // Handle incoming messages
    ws.on("message", (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        logger.debug(`WebSocket: Message from ${clientId}:`, message);

        switch (message.type) {
          case "ping":
            // Respond to ping with pong
            ws.send(
              JSON.stringify({
                type: "pong",
                data: { timestamp: new Date().toISOString() },
              }),
            );
            break;

          case "chat":
            // Broadcast chat message to all connected clients
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
            ); // Exclude sender
            break;

          case "status":
            // Return server status
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
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid JSON message" },
          }),
        );
      }
    });

    // Handle disconnection
    ws.on("close", () => {
      clients.delete(clientId);
      logger.info(
        `WebSocket: Client ${clientId} disconnected (Total: ${clients.size})`,
      );
    });

    // Handle errors
    ws.on("error", (error) => {
      logger.error(`WebSocket: Client ${clientId} error:`, error);
      clients.delete(clientId);
    });
  });

  return wss;
};

/**
 * Broadcast a message to all connected clients (optionally excluding one)
 */
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
