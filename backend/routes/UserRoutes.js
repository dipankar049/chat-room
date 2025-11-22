const express = require('express');
const router = express.Router();
const { signup, login, googleRegisterOrLoginUser } = require("../controller/UserController");

router.post('/signup', signup);
router.post('/login', login);
router.post('/googleLogin', googleRegisterOrLoginUser);

module.exports = router;