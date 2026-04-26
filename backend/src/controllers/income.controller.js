const Income = require('../models/Income');

const getIncomes = async (req, res) => {
  try {
    const { startDate, endDate, source, sortBy = '-date' } = req.query;
    
    let query = { user: req.user.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (source) {
      query.source = source;
    }
    
    const incomes = await Income.find(query).sort(sortBy);
    
    res.status(200).json({
      success: true,
      count: incomes.length,
      data: incomes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }
    
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createIncome = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const income = await Income.create(req.body);
    
    res.status(201).json({
      success: true,
      data: income,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateIncome = async (req, res) => {
  try {
    let income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }
    
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }
    
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    await income.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Income deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
};