const Program = require('../models/Program');
const User = require('../models/User');

exports.createProgram = async (req, res) => {
    try {
        if (req.body.workouts && req.body.sessionsPerWeek) {
            if (req.body.workouts.length !== parseInt(req.body.sessionsPerWeek)) {
                return res.status(400).json({
                    success: false,
                    message: `The number of workout days (${req.body.workouts.length}) does not match the sessions per week (${req.body.sessionsPerWeek}).`
                });
            }
        }

        req.body.creator = req.user.id;
        req.body.isFeatured = false;
        req.body.status = 'private';

        const program = await Program.create(req.body);

        res.status(201).json({
            success: true,
            data: program
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getMyPrograms = async (req, res) => {
    try {
        const myPrograms = await Program.find({ creator: req.user.id })
        res.status(200).json({ success: true, count: myPrograms.length, data: myPrograms });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error' })
    }
}
exports.updateMyProgram = async (req, res) => {
    try {
        let program = await Program.findById(req.params.id);

        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        if (program.creator.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this program' });
        }
        const sessionsPerWeek = req.body.sessionsPerWeek || program.sessionsPerWeek;
        const workouts = req.body.workouts || program.workouts;
        if (workouts.length !== parseInt(sessionsPerWeek)) {
            return res.status(400).json({
                success: false,
                message: `The number of workout days (${workouts.length}) does not match the sessions per week (${sessionsPerWeek}).`
            });
        }

        delete req.body.isFeatured;
        delete req.body.status;

        program = await Program.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: program });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }


}
exports.deleteMyProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        if (program.creator.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' })
        }

        await program.deleteOne();
        res.status(200).json({ success: true, message: 'Deleted Successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error' })
    }
}



exports.getPublicPrograms = async (req, res) => {
    try {
        let query = { status: 'approved', isPublic: true };

        if (req.query.type) {
            query.type = req.query.type;
        }

        if (req.query.featured === 'true') {
            query.isFeatured = true;
        }

        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' }
        }

        const programs = await Program.find(query).populate('creator', 'username');
        res.status(200).json({ success: true, count: programs.length, data: program })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
exports.getProgramById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id).populate({
            path: 'workouts.exercises.exercise',
            model: 'Exercise'
        }).populate('creator', 'username');

        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        if (program.status !== 'approved' && (!req.user || program.creator._id.toString() !== req.user.id)) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this program' });
        }

        res.status(200).json({ success: true, data: program });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


exports.adminCreateProgram = async (req, res) => {
    try {
        req.body.creator = req.user.id;
        req.body.isPublic = true;
        req.body.status = 'approved';
        req.body.isFeatured = req.body.isFeatured || false;

        const program = await Program.create(req.body);

        res.status(201).json({
            success: true,
            data: program
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getPendingPrograms = async (req, res) => {
    try {
        const pendingPrograms = await Program.find({ status: 'pending' });
        res.status(200).json({ success: true, count: pendingPrograms.length, data: pendingPrograms });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
exports.approveProgram = async (req, res) => {

    try {
        const program = await Program.findById(req.params.id, { status: 'pending' }, { new: true });
        res.status(200).json({ success: true, data: program });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
exports.rejectProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id, { status: 'pending' }, { new: true });
        res.status(200).json({ success: true, data: program });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
exports.adminUpdateProgram = async (req, res) => {
    try {
        const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.status(200).json({ success: true, data: program });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
