const Expense = require('../models/Expense');
const Income = require('../models/Income');

const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get total income for current month
    const incomes = await Income.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Get total expenses for current month
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate balance and savings
    const balance = totalIncome - totalExpenses;
    const savings = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    // Get recent transactions
    const recentTransactions = [...expenses, ...incomes]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
    
    // Get monthly overview (last 6 months)
    const monthlyOverview = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthStart = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);
      
      const monthIncomes = await Income.find({
        user: req.user.id,
        date: { $gte: monthStart, $lte: monthEnd },
      });
      const monthExpenses = await Expense.find({
        user: req.user.id,
        date: { $gte: monthStart, $lte: monthEnd },
      });
      
      monthlyOverview.push({
        month: month.toLocaleString('default', { month: 'short' }),
        income: monthIncomes.reduce((sum, inc) => sum + inc.amount, 0),
        expenses: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      });
    }
    
    // Get category breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = 0;
      }
      categoryBreakdown[expense.category] += expense.amount;
    });
    
    const categoryData = Object.keys(categoryBreakdown).map(category => ({
      category,
      amount: categoryBreakdown[category],
    }));
    
    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        savings: savings.toFixed(1),
        recentTransactions,
        monthlyOverview,
        categoryData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReports = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let dateFilter = {};
    
    if (period === 'weekly') {
      // Get last 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        weeks.push({
          week: `Week ${4 - i}`,
          start: weekStart,
          end: weekEnd,
        });
      }
      
      const weeklyData = await Promise.all(
        weeks.map(async (week) => {
          const expenses = await Expense.find({
            user: req.user.id,
            date: { $gte: week.start, $lte: week.end },
          });
          
          const incomes = await Income.find({
            user: req.user.id,
            date: { $gte: week.start, $lte: week.end },
          });
          
          return {
            period: week.week,
            expenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
            income: incomes.reduce((sum, inc) => sum + inc.amount, 0),
          };
        })
      );
      
      return res.status(200).json({
        success: true,
        data: weeklyData,
      });
    } else {
      // Monthly data for the year
      const monthlyData = [];
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        
        const expenses = await Expense.find({
          user: req.user.id,
          date: { $gte: monthStart, $lte: monthEnd },
        });
        
        const incomes = await Income.find({
          user: req.user.id,
          date: { $gte: monthStart, $lte: monthEnd },
        });
        
        monthlyData.push({
          period: new Date(year, month).toLocaleString('default', { month: 'short' }),
          expenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
          income: incomes.reduce((sum, inc) => sum + inc.amount, 0),
        });
      }
      
      res.status(200).json({
        success: true,
        data: monthlyData,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getReports,
};