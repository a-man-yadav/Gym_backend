const Program = require('../models/Program');
const mongoose = require('mongoose');

exports.createMyProgram = async (req, res) => {
  try {
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

exports.getMyPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ creator: req.user._id });
    res.status(200).json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

exports.updateMyProgram = async (req, res) => {
  try {
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

exports.createProgramAdmin = async (req, res) => {
  try {
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

exports.getAllProgramsAdmin = async (req, res) => {
  try {
    const programs = await Program.find().populate('creator', 'name email role');
    res.status(200).json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProgramAdmin = async (req, res) => {
  try {
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
