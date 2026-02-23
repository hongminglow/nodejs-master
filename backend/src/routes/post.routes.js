/**
 * ============================================
 * Post REST Routes
 * ============================================
 */

const express = require("express");
const postController = require("../controllers/post.controller");
const { validate } = require("../middleware/validate");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { createPostSchema, updatePostSchema, getPostSchema, listPostsSchema } = require("../validators/post.validator");

const router = express.Router();

// ── Public Routes ──────────────────────────────
// Anyone can list and read posts
router.get("/", validate(listPostsSchema), asyncHandler(postController.list));

router.get("/:id", validate(getPostSchema), asyncHandler(postController.getById));

// ── Protected Routes ───────────────────────────
// Must be logged in to create, update, or delete
router.post("/", requireAuth, validate(createPostSchema), asyncHandler(postController.create));

router.put("/:id", requireAuth, validate(updatePostSchema), asyncHandler(postController.update));

router.delete("/:id", requireAuth, validate(getPostSchema), asyncHandler(postController.delete));

module.exports = router;
