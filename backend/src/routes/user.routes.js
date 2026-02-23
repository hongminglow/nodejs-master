/**
 * ============================================
 * User REST Routes
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Routes map HTTP methods + URLs to controller actions
 * - We use `asyncHandler` to catch async errors automatically
 * - Middleware chain: validate → (optionally authenticate) → controller
 * - RESTful conventions:
 *     GET    /users       → list all users
 *     GET    /users/:id   → get one user
 *     POST   /users       → create a user
 *     PUT    /users/:id   → update a user
 *     DELETE /users/:id   → delete a user
 */

const express = require("express");
const userController = require("../controllers/user.controller");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const {
	createUserSchema,
	updateUserSchema,
	getUserSchema,
	listUsersSchema,
	loginSchema,
} = require("../validators/user.validator");

const router = express.Router();

// ── Public Routes ──────────────────────────────
router.post("/register", validate(createUserSchema), asyncHandler(userController.create));

router.post("/login", validate(loginSchema), asyncHandler(userController.login));

// ── Protected Routes (require authentication) ──
router.get("/", requireAuth, validate(listUsersSchema), asyncHandler(userController.list));

router.get("/:id", requireAuth, validate(getUserSchema), asyncHandler(userController.getById));

router.put("/:id", requireAuth, validate(updateUserSchema), asyncHandler(userController.update));

router.delete("/:id", requireAuth, validate(getUserSchema), asyncHandler(userController.delete));

module.exports = router;
