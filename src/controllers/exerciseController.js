const Exercise = require('../models/Exercise')
const User = require('../models/User')

exports.createExercise = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;

        const exercise = await Exercise.create(req.body);
        res.status(201).json({ success: true, data: exercise });
    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

exports.updateExercise = async (req, res) => {
    try {
        let exercise = await Exercise.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: exercise });

    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

exports.deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise Not found' })
        }
        await exercise.deleteOne();
        res.status(200).json({ success: true, message: 'Exercise deleted successfully' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

exports.getAllExercise = async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.status(200).json({ success: true, count: exercises.length, data: exercises });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

    }
}

exports.getExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req, params.id);
        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}