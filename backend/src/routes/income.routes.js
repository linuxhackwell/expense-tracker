const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/income.controller');

router.route('/')
  .get(protect, getIncomes)
  .post(protect, createIncome);

router.route('/:id')
  .get(protect, getIncome)
  .put(protect, updateIncome)
  .delete(protect, deleteIncome);

module.exports = router;