const mongoose = require('mongoose');

const WorkoutExerciseSchema = new mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    sets: {
        type: Number,
        required: true,
        min: [1, 'Sets must be at least 1'],
        max: [20, 'Sets cannot exceed 20']
    },
    reps: {
        type: Number,
        required: true,
        min: [1, 'Reps must be at least 1'],
        max: [100, 'Reps cannot exceed 100']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Notes cannot be more than 200 characters']
    }
}, { _id: false }); 

const WorkoutDaySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
        min: [1, 'Day must start from 1']
    },
    title: {
        type: String,
        default: '',
        trim: true,
        maxlength: [30, 'Title cannot be more than 30 characters']
    },
    exercises: {
        type: [WorkoutExerciseSchema],
        validate: v => Array.isArray(v) && v.length > 0
    }
}, { _id: false });

const ProgramSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a program name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    duration: {
        type: String,
        required: [true, 'Please add a duration'],
        enum: ['4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks', '14 weeks', '16 weeks']
    },
    goals: {
        type: [String],
        required: [true, 'Please add goals'],
        enum: ['strength', 'hypertrophy', 'fat-loss', 'weight-gain']
    },
    level: {
        type: String,
        required: [true, 'Please add a level'],
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    sessionsPerWeek: {
        type: Number,
        required: [true, 'Please add sessions per week'],
        enum: [3, 4, 5, 6]
    },
    durationPerSession: {
        type: String,
        required: [true, 'Please add duration per session'],
        enum: ['30 minutes', '45 minutes', '60 minutes', '75 minutes', '90 minutes']
    },
    workouts: [WorkoutDaySchema],

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['private', 'public'], 
        default: 'private' // private for user but public for admin
    },
}, { timestamps: true });

module.exports = mongoose.model('Program', ProgramSchema);
