const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/my', protect, authorize('user'), programController.createMyProgram);
router.get('/my', protect, authorize('user'), programController.getMyPrograms);
router.get('/my/:id', protect, authorize('user'), programController.getMyProgramById);
router.put('/my/:id', protect, authorize('user'), programController.updateMyProgram);
router.delete('/my/:id', protect, authorize('user'), programController.deleteMyProgram);

router.post('/admin', protect, authorize('admin'), programController.createProgramAdmin);
router.get('/admin', protect, authorize('admin'), programController.getAllProgramsAdmin);
router.put('/admin/:id', protect, authorize('admin'), programController.updateProgramAdmin);
router.delete('/admin/:id', protect, authorize('admin'), programController.deleteProgramAdmin);
router.put('/admin/feature/:id', protect, authorize('admin'), programController.toggleFeaturedProgram);

router.get('/', programController.getPublicPrograms);
router.get('/:id', programController.getPublicProgramById);

module.exports = router;
