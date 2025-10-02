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
  getAllSalaries,
  addSalary,
  updateSalary,
  deleteSalary,
} = require("../controllers/salaryController");
const { verifyToken } = require("../controllers/userController");

// Routes
router.get("/", verifyToken, getAllSalaries);
router.post("/", verifyToken, addSalary);
router.put("/:id", verifyToken, updateSalary);
router.delete("/:id", verifyToken, deleteSalary);

module.exports = router;
