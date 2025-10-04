const express = require('express')
const {createExercise, updateExercise, deleteExercise, getAllExercise, getExercise} = require('../controllers/exerciseController')
const {protect, authorize} = require('../middlewares/authMiddleware')

const router = express.Router();

router.route('/').get(getAllExercise)
router.route('/:id').get(getExercise)

router.use(protect)
router.use(authorize)

router.route('/').post(createExercise)
router.route('/:id').put(updateExercise).delete(deleteExercise)


module.exports = router