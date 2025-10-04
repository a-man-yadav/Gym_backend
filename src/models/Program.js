const mongoose = require('mongoose');

const WorkoutExerciseSchema = new mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    sets: {
        type: Number,
        required: true
    },
    reps: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Notes cannot be more than 200 characters']
    }
});

const WorkoutDaySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        default: '',
        trim: true,
        maxlength: [20, 'Title cannot be more than 20 characters']
    },
    exercises: [WorkoutExerciseSchema]
});

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
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    duration: {
        type: String,
        required: [true, 'Please add a duration'],
        enum: ['4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks', '14 weeks', '16 weeks']
    },
    goals: {
        type: String,
        required: [true, 'Please add goals'],
        enum: ['strength', 'hypertrophy', 'fat-loss', 'weight-gain']
    },
    level: {
        type: String,
        required: [true, 'Please add a level'],
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    sessionsPerWeek: {
        type: String,
        required: [true, 'Please add a sessions per week'],
        enum: ['3', '4', '5', '6']
    },
    durationPerSession: {
        type: String,
        required: [true, 'Please add a duration per session'],
        enum: ['30 minutes', '45 minutes', '60 minutes', '75 minutes', '90 minutes']
    },
    type:{
        type: String,
        enum: ['exercise', 'diet'],
        required: true
    },
    isFeature: {
        type:Boolean,
        default: false
    },

    workouts: [WorkoutDaySchema],

    creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic:{
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['private','pending_approval', 'approved', 'rejected'],
        default: 'private'
    },
},{timestamps: true}); 

module.exports = mongoose.model('Program', ProgramSchema);