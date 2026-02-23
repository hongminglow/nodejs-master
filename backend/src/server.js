/**
 * ============================================
 * Server Entry Point
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - This file is the entry point of the application
 * - We separate app setup (app.js) from server startup (server.js)
 *   so we can import `app` in tests without starting the server
 * - We initialize the database before listening for requests
 * - Graceful shutdown ensures the server closes cleanly
 *
 * To start: `npm run dev` (with nodemon) or `npm start`
 */

const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const { app, finalizeMiddleware } = require("./app");
const config = require("./config");
const logger = require("./utils/logger");
const { sequelize } = require("./database/connection");
const { typeDefs, resolvers } = require("./graphql");
const { setupWebSocket } = require("./websocket");
const { startScheduler } = require("./scheduler");
const { authContext } = require("./middleware/auth");

const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");

/**
 * Bootstrap the application
 * - Connect to the database
 * - Set up Apollo GraphQL server
 * - Set up WebSocket server
 * - Start listening for HTTP requests
 */
async function startServer() {
	try {
		// ── Step 1: Connect to Database ──────────────
		await sequelize.authenticate();
		logger.info("✅ Database connection established");

		// Sync models to database (creates tables if they don't exist)
		// Altering tables in SQLite often drops them and causes data loss!
		await sequelize.sync({ force: false });
		logger.info("✅ Database models synchronized");

		// ── Step 2: Create HTTP Server ───────────────
		const httpServer = http.createServer(app);

		// ── Step 3: Set up Apollo GraphQL Server ─────
		const schema = makeExecutableSchema({ typeDefs, resolvers });

		// GraphQL Subscriptions Server
		const wsServer = new WebSocketServer({
			server: httpServer,
			path: "/graphql",
		});
		const serverCleanup = useServer({ schema }, wsServer);

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

		// Mount GraphQL HTTP
		app.use(
			"/graphql",
			expressMiddleware(apolloServer, {
				context: authContext,
			}),
		);

		// Register 404 and error handlers AFTER GraphQL is mounted
		finalizeMiddleware();

		// ── Step 4: Set up General WebSockets ────────
		const rawWsServer = new WebSocketServer({ noServer: true });
		setupWebSocket(rawWsServer);

		httpServer.on("upgrade", (request, socket, head) => {
			if (request.url === "/") {
				// non-graphql path
				rawWsServer.handleUpgrade(request, socket, head, (ws) => {
					rawWsServer.emit("connection", ws, request);
				});
			} // GraphQL WS handles itself internally by matching /graphql
		});

		logger.info("✅ Standard WebSocket server initialized on /");

		// ── Step 5: Start Scheduler ──────────────────
		startScheduler();
		logger.info("✅ Job scheduler started");

		// ── Step 6: Start Listening ──────────────────
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

		// ── Graceful Shutdown ────────────────────────
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

// ── Launch ──────────────────────────────────────
startServer();
