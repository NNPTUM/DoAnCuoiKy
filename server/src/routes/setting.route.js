const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { getSettings, updateSettings } = require("../controllers/setting.controller");

router.get("/", verifyToken, getSettings);
router.put("/", verifyToken, updateSettings);

module.exports = router;
