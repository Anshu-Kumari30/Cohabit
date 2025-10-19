const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide expense description'],
    trim: true,
    maxlength: [100, 'Description cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide expense amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    enum: ['utilities', 'food', 'rent', 'entertainment', 'household', 'other'],
    default: 'other'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    settled: {
      type: Boolean,
      default: false
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  receipt: {
    type: String,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

expenseSchema.index({ house: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });

expenseSchema.virtual('isSettled').get(function() {
  return this.splitWith.every(split => split.settled);
});

expenseSchema.methods.calculateShares = function() {
  const totalPeople = this.splitWith.length;
  const shareAmount = this.amount / totalPeople;
  
  this.splitWith.forEach(split => {
    split.amount = shareAmount;
  });
  
  return this;
};

expenseSchema.statics.calculateBalances = async function(houseId) {
  const expenses = await this.find({ house: houseId })
    .populate('paidBy', 'firstName lastName')
    .populate('splitWith.user', 'firstName lastName');
  
  const balances = {};
  
  expenses.forEach(expense => {
    const paidById = expense.paidBy._id.toString();
    
    if (!balances[paidById]) {
      balances[paidById] = {
        userId: paidById,
        name: `${expense.paidBy.firstName} ${expense.paidBy.lastName}`,
        paid: 0,
        owes: 0,
        balance: 0
      };
    }
    
    balances[paidById].paid += expense.amount;
    
    expense.splitWith.forEach(split => {
      const userId = split.user._id.toString();
      
      if (!balances[userId]) {
        balances[userId] = {
          userId: userId,
          name: `${split.user.firstName} ${split.user.lastName}`,
          paid: 0,
          owes: 0,
          balance: 0
        };
      }
      
      balances[userId].owes += split.amount;
    });
  });
  
  Object.keys(balances).forEach(userId => {
    balances[userId].balance = balances[userId].paid - balances[userId].owes;
  });
  
  return Object.values(balances);
};

module.exports = mongoose.model('Expense', expenseSchema);