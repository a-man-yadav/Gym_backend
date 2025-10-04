const express = require('express')
const {getUser, updateUser, updatePassword, deleteUser} = require('../controllers/userController')
const {protect} = require('../middlewares/authMiddleware')

const router = express.Router();

router.get('/me', protect, getUser);
router.put('/update',protect, updateUser)
router.delete('/delete',protect, deleteUser)
router.put('/updatepassword',protect, updatePassword);

module.exports = router;