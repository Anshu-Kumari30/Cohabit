const mongoose = require('mongoose');

const choreSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide chore title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null
  },
  category: {
    type: String,
    enum: ['cleaning', 'cooking', 'shopping', 'maintenance', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

choreSchema.index({ house: 1, dueDate: 1 });
choreSchema.index({ assignedTo: 1, completed: 1 });

choreSchema.virtual('isOverdue').get(function() {
  return !this.completed && new Date() > this.dueDate;
});

choreSchema.methods.markComplete = function() {
  this.completed = true;
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

choreSchema.methods.markIncomplete = function() {
  this.completed = false;
  this.status = 'pending';
  this.completedAt = null;
  return this.save();
};

choreSchema.statics.getHouseStats = async function(houseId) {
  const total = await this.countDocuments({ house: houseId });
  const completed = await this.countDocuments({ house: houseId, completed: true });
  const pending = await this.countDocuments({ house: houseId, completed: false });
  const overdue = await this.countDocuments({
    house: houseId,
    completed: false,
    dueDate: { $lt: new Date() }
  });
  
  return {
    total,
    completed,
    pending,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

choreSchema.statics.getUserStats = async function(userId) {
  const total = await this.countDocuments({ assignedTo: userId });
  const completed = await this.countDocuments({ assignedTo: userId, completed: true });
  const pending = await this.countDocuments({ assignedTo: userId, completed: false });
  
  return {
    total,
    completed,
    pending,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

choreSchema.pre('save', function(next) {
  if (this.completed && !this.completedAt) {
    this.completedAt = new Date();
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Chore', choreSchema);