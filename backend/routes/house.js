const express = require('express');
const router = express.Router();
const House = require('../models/House');
const User = require('../models/User');
const { protect, isHouseAdmin, isHouseMember } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide house name'
      });
    }

    if (req.user.house) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of a house. Leave current house first.'
      });
    }

    const house = await House.create({
      name,
      description,
      admin: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await User.findByIdAndUpdate(req.user._id, { 
      house: house._id,
      role: 'admin'
    });

    const populatedHouse = await House.findById(house._id)
      .populate('admin', 'firstName lastName email avatar')
      .populate('members.user', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      message: 'House created successfully',
      house: populatedHouse
    });

  } catch (error) {
    console.error('Create House Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating house',
      error: error.message
    });
  }
});

router.get('/my-house', protect, async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(404).json({
        success: false,
        message: 'You are not part of any house'
      });
    }

    const house = await House.findById(req.user.house)
      .populate('admin', 'firstName lastName email avatar')
      .populate('members.user', 'firstName lastName email avatar');

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    res.status(200).json({
      success: true,
      house
    });

  } catch (error) {
    console.error('Get House Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching house',
      error: error.message
    });
  }
});

router.post('/join/:inviteCode', protect, async (req, res) => {
  try {
    if (req.user.house) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of a house. Leave current house first.'
      });
    }

    const house = await House.findOne({ inviteCode: req.params.inviteCode.toUpperCase() });

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    const isMember = house.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this house'
      });
    }

    await house.addMember(req.user._id);

    await User.findByIdAndUpdate(req.user._id, { 
      house: house._id,
      role: 'member'
    });

    const updatedHouse = await House.findById(house._id)
      .populate('admin', 'firstName lastName email avatar')
      .populate('members.user', 'firstName lastName email avatar');

    res.status(200).json({
      success: true,
      message: 'Successfully joined house',
      house: updatedHouse
    });

  } catch (error) {
    console.error('Join House Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining house',
      error: error.message
    });
  }
});

router.delete('/:houseId/leave', protect, isHouseMember, async (req, res) => {
  try {
    const house = req.house;

    if (house.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot leave the house. Transfer admin rights or delete the house.'
      });
    }

    await house.removeMember(req.user._id);

    await User.findByIdAndUpdate(req.user._id, { 
      house: null,
      role: 'member'
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left the house'
    });

  } catch (error) {
    console.error('Leave House Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving house',
      error: error.message
    });
  }
});

module.exports = router;