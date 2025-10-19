const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide house name'],
    trim: true,
    maxlength: [50, 'House name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    splitMethod: {
      type: String,
      enum: ['equal', 'custom'],
      default: 'equal'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

houseSchema.pre('save', async function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

houseSchema.methods.addMember = function(userId, role = 'member') {
  const memberExists = this.members.some(m => m.user.toString() === userId.toString());
  
  if (!memberExists) {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
  
  return this.save();
};

houseSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('House', houseSchema);