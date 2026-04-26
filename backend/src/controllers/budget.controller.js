const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { user: req.user.id };
    
    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    } else {
      const currentDate = new Date();
      query.month = currentDate.getMonth() + 1;
      query.year = currentDate.getFullYear();
    }
    
    const budgets = await Budget.find(query);
    
    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await Expense.find({
          user: req.user.id,
          category: budget.category,
          date: {
            $gte: new Date(budget.year, budget.month - 1, 1),
            $lte: new Date(budget.year, budget.month, 0),
          },
        });
        
        const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
          ...budget.toObject(),
          spent,
          remaining: budget.amount - spent,
          percentage: (spent / budget.amount) * 100,
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: budgetsWithSpent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBudget = async (req, res) => {
  try {
    req.body.user = req.user.id;
    
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category: req.body.category,
      month: req.body.month,
      year: req.body.year,
    });
    
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and month',
      });
    }
    
    const budget = await Budget.create(req.body);
    
    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }
    
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }
    
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    await budget.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};