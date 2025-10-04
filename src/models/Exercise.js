// src/models/Exercise.js
const mongoose = require('mongoose');

const muscleGroups = [
    'Chest', 'Lats', 'Upper Back', 'Lower Back', 'Traps', 'Abs',
    'Quads', 'Hamstrings', 'Calves', 'Glutes', 'Front Delts',
    'Side Delts', 'Rear Delts', 'Biceps', 'Triceps', 'Forearms', 'Cardio'
];

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an exercise name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    coverImageUrl: {
        type: String,
        required: [true, 'Please add a cover image URL'],
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    primaryMuscleGroup: {
        type: String,
        required: [true, 'Please specify the primary muscle group'],
        enum: muscleGroups
    },
    secondaryMuscleGroups: [ // Renamed to plural for clarity
        {
            type: String,
            enum: muscleGroups
        }
    ],
    videoUrl: {
        type: String,
        required: [true, 'Please add a video URL'],
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Exercise = mongoose.model("Exercise", ExerciseSchema);

module.exports = Exercise;