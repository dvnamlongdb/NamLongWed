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
  getAllInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");
const { verifyToken } = require("../controllers/userController");

// Routes
router.get("/", verifyToken, getAllInvoices);
router.post("/", verifyToken, addInvoice);
router.put("/:id", verifyToken, updateInvoice);
router.delete("/:id", verifyToken, deleteInvoice);

module.exports = router;
