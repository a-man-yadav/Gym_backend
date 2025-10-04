const express = require('express')
const {createProgram, getMyPrograms, updateMyProgram,deleteMyProgram,getPublicPrograms,getProgramById,approveProgram,rejectProgram,adminCreateProgram,adminUpdateProgram} = require('../controllers/programController')
const {protect, authorize} = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/pubic', getPublicPrograms)
router.get(':/id', getProgramById)

router.use(protect)

router.post('/', createProgram)
router.get('/myprograms', getMyPrograms)
router.put('/:id', updateMyProgram)
router.delete('/:id', deleteMyProgram)

router.use(authorize('admin'))

router.post('/admin/create', adminCreateProgram)
router.get('/admin/pending', getPendingPrograms);
router.put('/admin/:id/approve', approveProgram);
router.put('/admin/:id/reject', rejectProgram);
router.put('/admin/:id', adminUpdateProgram);


module.exports = router;