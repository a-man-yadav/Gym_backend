const adminController = require('../controllers/adminController')
const express = require('express')
const {protect, authorize} = require('../middlewares/authMiddleware')

const router = express.Router();

router.use(protect)
router.use(authorize('admin'))

router.get('/users', adminController.getAllUsers)
router.route('/user/:id').get(adminController.getUserById).delete(adminController.deleteUser)
router.put('/user/:id/update', adminController.updateUserRole)

module.exports = router