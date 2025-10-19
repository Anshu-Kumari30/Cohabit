const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

exports.isHouseAdmin = async (req, res, next) => {
  try {
    const House = require('../models/House');
    const house = await House.findById(req.params.houseId || req.body.house);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    if (house.admin.toString() !== req.user._id.toString()) {
      const member = house.members.find(
        m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'You do not have admin permissions for this house'
        });
      }
    }

    req.house = house;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking admin permissions',
      error: error.message
    });
  }
};

exports.isHouseMember = async (req, res, next) => {
  try {
    const House = require('../models/House');
    const houseId = req.params.houseId || req.body.house || req.user.house;

    const house = await House.findById(houseId);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    if (house.admin.toString() === req.user._id.toString()) {
      req.house = house;
      return next();
    }

    const isMember = house.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this house'
      });
    }

    req.house = house;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking house membership',
      error: error.message
    });
  }
};

exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};