/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
const express = require("express");

const router = express.Router();
const { loginUser, registerUser, verifyToken } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyToken);

module.exports = router;
