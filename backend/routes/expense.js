const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { description, amount, category, splitWith, date, notes } = req.body;

    if (!req.user.house) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a house to create expenses'
      });
    }

    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide description and amount'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const expense = await Expense.create({
      house: req.user.house,
      description,
      amount: parseFloat(amount),
      category: category || 'other',
      paidBy: req.user._id,
      date: date || new Date(),
      notes,
      splitWith: splitWith || [{ user: req.user._id, amount: parseFloat(amount) }]
    });

    if (splitWith && splitWith.length > 0) {
      expense.calculateShares();
      await expense.save();
    }

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'firstName lastName email avatar')
      .populate('splitWith.user', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense: populatedExpense
    });

  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
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

    const expenses = await Expense.find({ house: req.user.house })
      .populate('paidBy', 'firstName lastName email avatar')
      .populate('splitWith.user', 'firstName lastName email avatar')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (error) {
    console.error('Get Expenses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the expense creator can delete it'
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete Expense Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
});

router.get('/balances/calculate', protect, async (req, res) => {
  try {
    if (!req.user.house) {
      return res.status(400).json({
        success: false,
        message: 'You are not part of any house'
      });
    }

    const balances = await Expense.calculateBalances(req.user.house);

    res.status(200).json({
      success: true,
      balances
    });

  } catch (error) {
    console.error('Calculate Balances Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating balances',
      error: error.message
    });
  }
});

module.exports = router;