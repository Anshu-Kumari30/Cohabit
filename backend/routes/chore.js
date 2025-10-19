const express = require('express');
const router = express.Router();
const Chore = require('../models/Chore');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, category, notes } = req.body;

    if (!req.user.house) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a house to create chores'
      });
    }

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, assignedTo, and dueDate'
      });
    }

    const chore = await Chore.create({
      house: req.user.house,
      title,
      description,
      assignedTo,
      createdBy: req.user._id,
      dueDate,
      priority: priority || 'medium',
      category: category || 'other',
      notes
    });

    const populatedChore = await Chore.findById(chore._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      message: 'Chore created successfully',
      chore: populatedChore
    });

  } catch (error) {
    console.error('Create Chore Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chore',
      error: error.message
    });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(400).json({
        success: false,
        message: 'You are not part of any house'
      });
    }

    const chores = await Chore.find({ house: req.user.house })
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({
      success: true,
      count: chores.length,
      chores
    });

  } catch (error) {
    console.error('Get Chores Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chores',
      error: error.message
    });
  }
});

router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    let chore = await Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({
        success: false,
        message: 'Chore not found'
      });
    }

    if (chore.house.toString() !== req.user.house?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this chore'
      });
    }

    if (chore.completed) {
      await chore.markIncomplete();
    } else {
      await chore.markComplete();
    }

    const updatedChore = await Chore.findById(chore._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar');

    res.status(200).json({
      success: true,
      message: chore.completed ? 'Chore marked as complete' : 'Chore marked as incomplete',
      chore: updatedChore
    });

  } catch (error) {
    console.error('Toggle Chore Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling chore',
      error: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({
        success: false,
        message: 'Chore not found'
      });
    }

    if (chore.house.toString() !== req.user.house?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chore'
      });
    }

    await Chore.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Chore deleted successfully'
    });

  } catch (error) {
    console.error('Delete Chore Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting chore',
      error: error.message
    });
  }
});

module.exports = router;