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
  getAllCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { verifyToken } = require("../controllers/userController");

// Routes
router.get("/", verifyToken, getAllCustomers);
router.post("/", verifyToken, addCustomer);
router.put("/:id", verifyToken, updateCustomer);
router.delete("/:id", verifyToken, deleteCustomer);

module.exports = router;
