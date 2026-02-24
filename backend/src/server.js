/**
 * ============================================
 * Server Entry Point
 * ============================================
 */

const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");

const { app, finalizeMiddleware } = require("./app");
const config = require("./config");
const logger = require("./utils/logger");
const { sequelize } = require("./database/connection");
const { typeDefs, resolvers } = require("./graphql");
const { setupWebSocket } = require("./websocket");
const { startScheduler } = require("./scheduler");
const { authContext, decodeToken } = require("./middleware/auth");

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connection established");

    await sequelize.sync({ force: false });
    logger.info("✅ Database models synchronized");

    const httpServer = http.createServer(app);
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // GraphQL subscriptions on manual WS upgrade path (/graphql)
    const graphqlWsServer = new WebSocketServer({ noServer: true });
    const serverCleanup = useServer(
      {
        schema,
        context: async (ctx) => {
          const authHeader =
            typeof ctx.connectionParams?.authorization === "string"
              ? ctx.connectionParams.authorization
              : null;
          const user = decodeToken(authHeader);
          return { user };
        },
      },
      graphqlWsServer,
    );

    const apolloServer = new ApolloServer({
      schema,
      plugins: [
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
      formatError: (error) => {
        logger.error("GraphQL Error:", error);
        return {
          message: error.message,
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          path: error.path,
        };
      },
    });

    await apolloServer.start();
    logger.info("✅ Apollo GraphQL server started with Subscriptions capability");

    app.use(
      "/graphql",
      expressMiddleware(apolloServer, {
        context: authContext,
      }),
    );

    finalizeMiddleware();

    const rawWsServer = new WebSocketServer({ noServer: true });
    setupWebSocket(rawWsServer);

    httpServer.on("upgrade", (request, socket, head) => {
      if (request.url === "/graphql") {
        graphqlWsServer.handleUpgrade(request, socket, head, (ws) => {
          graphqlWsServer.emit("connection", ws, request);
        });
      } else if (request.url === "/") {
        rawWsServer.handleUpgrade(request, socket, head, (ws) => {
          rawWsServer.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    logger.info("✅ Standard WebSocket server initialized on /");

    startScheduler();
    logger.info("✅ Job scheduler started");

    httpServer.listen(config.server.port, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║       🚀 Node.js Master Server              ║
╠══════════════════════════════════════════════╣
║  REST API:    http://localhost:${config.server.port}/api     ║
║  GraphQL:     http://localhost:${config.server.port}/graphql ║
║  Health:      http://localhost:${config.server.port}/api/health ║
║  WebSocket:   ws://localhost:${config.server.port}           ║
║  Environment: ${config.server.env.padEnd(30)}║
╚══════════════════════════════════════════════╝
      `);
    });

    const shutdown = async (signal) => {
      logger.info(`\n${signal} received — shutting down gracefully...`);
      httpServer.close(async () => {
        await sequelize.close();
        logger.info("👋 Server closed. Goodbye!");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
