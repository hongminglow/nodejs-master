/**
 * ============================================
 * GraphQL Module Index
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - This index file re-exports typeDefs and resolvers
 * - It's a common pattern to have an index.js that acts as
 *   the public API of a module/folder
 * - As your app grows, you can split typeDefs and resolvers
 *   into multiple files and merge them here
 */

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

module.exports = { typeDefs, resolvers };
