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

// // Routes
// router.get("/", verifyToken, async (req: any, res: any) => {
//   try {
//     // Import User model dynamically
//     const User = require("../Database/models/User");
//     const users = await User.find().select('-password');
//     res.status(200).json(users);
//   } catch (error: any) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyToken);

module.exports = router;
