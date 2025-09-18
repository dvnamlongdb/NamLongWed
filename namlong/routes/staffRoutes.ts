/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import express from "express";

const router = express.Router();
const {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");
const { verifyToken } = require("../controllers/userController");

// Routes
router.get("/", verifyToken, getAllStaff);
router.post("/", verifyToken, addStaff);
router.put("/:id", verifyToken, updateStaff);
router.delete("/:id", verifyToken, deleteStaff);

module.exports = router;
