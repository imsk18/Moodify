const {Router} = require("express");
const authController = require("../controllers/authController");
// const { route } = require("../app");

const router = Router()

router.post("/register",authController.userRegister)

module.exports = router