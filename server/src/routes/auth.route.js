const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.getMe);
router.put("/me", verifyToken, authController.updateProfile);
router.get("/users/:userId", verifyToken, authController.getUserById);

module.exports = router;
