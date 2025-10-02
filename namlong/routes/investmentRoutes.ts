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
  getAllInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
} = require("../controllers/investmentController");
const { verifyToken } = require("../controllers/userController");

// Routes
router.get("/", verifyToken, getAllInvestments);
router.post("/", verifyToken, addInvestment);
router.put("/:id", verifyToken, updateInvestment);
router.delete("/:id", verifyToken, deleteInvestment);

module.exports = router;
