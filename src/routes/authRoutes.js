const express = require("express")
const {register, login, logout, forgotPassword, resetPassword} = require('../controllers/authController');
const {protect} = require('../middlewares/authMiddleware');
const { route } = require("./userRoutes");

const router = express.Router();

router.post('/register', register)
router.post('/login', login);
router.get('/logout', protect, logout)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resetToken', resetPassword)

module.exports = router;