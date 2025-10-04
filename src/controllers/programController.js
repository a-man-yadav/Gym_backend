const Program = require('../models/Program');
const mongoose = require('mongoose');

// ================= USER CONTROLLERS =================

// @desc Create a new program (always private)
exports.createMyProgram = async (req, res) => {
  try {
    const { workouts = [], sessionsPerWeek } = req.body;

    if (workouts.length !== sessionsPerWeek) {
      return res.status(400).json({
        success: false,
        message: `Workout array length (${workouts.length}) must equal sessionsPerWeek (${sessionsPerWeek})`
      });
    }

    const program = await Program.create({
      ...req.body,
      creator: req.user._id,
      status: 'private',
      isFeatured: false
    });

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Get all programs created by the logged-in user
exports.getMyPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ creator: req.user._id });
    res.status(200).json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get one program by ID (must be user’s own)
exports.getMyProgramById = async (req, res) => {
  try {
    const program = await Program.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!program)
      return res.status(404).json({ success: false, message: 'Program not found' });

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user’s own program
exports.updateMyProgram = async (req, res) => {
  try {
    const { workouts, sessionsPerWeek } = req.body;

    if (workouts && workouts.length !== sessionsPerWeek) {
      return res.status(400).json({
        success: false,
        message: `Workout array length (${workouts.length}) must equal sessionsPerWeek (${sessionsPerWeek})`
      });
    }

    const program = await Program.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!program)
      return res.status(404).json({ success: false, message: 'Program not found' });

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Delete user’s own program
exports.deleteMyProgram = async (req, res) => {
  try {
    const program = await Program.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!program)
      return res.status(404).json({ success: false, message: 'Program not found' });

    res.status(200).json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADMIN CONTROLLERS =================

// @desc Admin: create a new public program
exports.createProgramAdmin = async (req, res) => {
  try {
    const { workouts = [], sessionsPerWeek } = req.body;

    if (workouts.length !== sessionsPerWeek) {
      return res.status(400).json({
        success: false,
        message: `Workout array length (${workouts.length}) must equal sessionsPerWeek (${sessionsPerWeek})`
      });
    }

    const program = await Program.create({
      ...req.body,
      creator: req.user._id,
      status: 'public',
      isFeatured: req.body.isFeatured || false
    });

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Admin: get all programs (any status)
exports.getAllProgramsAdmin = async (req, res) => {
  try {
    const programs = await Program.find().populate('creator', 'name email role');
    res.status(200).json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Admin: update any program
exports.updateProgramAdmin = async (req, res) => {
  try {
    const { workouts, sessionsPerWeek } = req.body;

    if (workouts && workouts.length !== sessionsPerWeek) {
      return res.status(400).json({
        success: false,
        message: `Workout array length (${workouts.length}) must equal sessionsPerWeek (${sessionsPerWeek})`
      });
    }

    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!program)
      return res.status(404).json({ success: false, message: 'Program not found' });

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Admin: delete any program
exports.deleteProgramAdmin = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program)
      return res.status(404).json({ success: false, message: 'Program not found' });

    res.status(200).json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Admin: toggle featured flag
exports.toggleFeaturedProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program)
      return res.status(404).json({ success: false, message: 'Program not found' });

    program.isFeatured = !program.isFeatured;
    await program.save();

    res.status(200).json({
      success: true,
      message: `Program ${program.isFeatured ? 'featured' : 'unfeatured'}`,
      data: program
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= PUBLIC CONTROLLERS =================

// @desc Get all public programs
exports.getPublicPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ status: 'public' })
      .populate('creator', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single public program by ID
exports.getPublicProgramById = async (req, res) => {
  try {
    const program = await Program.findOne({
      _id: req.params.id,
      status: 'public'
    }).populate('creator', 'name');

    if (!program)
      return res.status(404).json({ success: false, message: 'Program not found or not public' });

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
