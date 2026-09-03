const {Router} = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth.middleware")

const router = Router()

router.post("/register",authController.userRegister);
router.post("/login",authController.userLogin);
router.get("/get-me",authMiddleware.authUser,authController.getMe);
router.post("/logout",authController.logOutUser);

module.exports = router