import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const IncomeModal = ({ isOpen, onClose, income, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: 'Salary',
    date: new Date(),
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (income) {
      setFormData({
        title: income.title,
        amount: income.amount,
        source: income.source,
        date: new Date(income.date),
        notes: income.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        source: 'Salary',
        date: new Date(),
        notes: '',
      });
    }
  }, [income]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 animate-slide-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {income ? 'Edit Income' : 'Add Income'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="e.g., Monthly Salary"
            />
          </div>
          
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="label">Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="input-field"
            >
              <option>Salary</option>
              <option>Freelance</option>
              <option>Business</option>
              <option>Investment</option>
              <option>Gift</option>
              <option>Refund</option>
              <option>Other</option>
            </select>
          </div>
          
          <div>
            <label className="label">Date</label>
            <DatePicker
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              className="input-field"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          
          <div>
            <label className="label">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : income ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('-date');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchIncomes();
  }, [sourceFilter, sortBy, startDate, endDate]);

  const fetchIncomes = async () => {
    try {
      let url = 'http://localhost:5000/api/incomes?';
      if (sourceFilter) url += `source=${sourceFilter}&`;
      if (sortBy) url += `sortBy=${sortBy}&`;
      if (startDate) url += `startDate=${startDate.toISOString()}&`;
      if (endDate) url += `endDate=${endDate.toISOString()}&`;
      
      const response = await axios.get(url);
      setIncomes(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch income records');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIncome = async (incomeData) => {
    try {
      if (selectedIncome) {
        await axios.put(`http://localhost:5000/api/incomes/${selectedIncome._id}`, incomeData);
        toast.success('Income updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/incomes', incomeData);
        toast.success('Income added successfully');
      }
      fetchIncomes();
    } catch (error) {
      toast.error(selectedIncome ? 'Failed to update income' : 'Failed to add income');
      throw error;
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/incomes/${id}`);
        toast.success('Income deleted successfully');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  const filteredIncomes = incomes.filter(income =>
    income.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your income sources</p>
        </div>
        <button
          onClick={() => {
            setSelectedIncome(null);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search income..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Sources</option>
            <option>Salary</option>
            <option>Freelance</option>
            <option>Business</option>
            <option>Investment</option>
            <option>Gift</option>
            <option>Refund</option>
            <option>Other</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="-date">Latest First</option>
            <option value="date">Oldest First</option>
            <option value="-amount">Highest Amount</option>
            <option value="amount">Lowest Amount</option>
          </select>
          
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setStartDate(update[0]);
              setEndDate(update[1]);
            }}
            placeholderText="Date Range"
            className="input-field"
            isClearable={true}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-green-100">Total Income</p>
            <p className="text-3xl font-bold mt-1">${totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-green-100">Total Transactions</p>
            <p className="text-3xl font-bold mt-1">{filteredIncomes.length}</p>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredIncomes.map((income) => (
              <tr key={income._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {income.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                    {income.source}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(income.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                  ${income.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedIncome(income);
                      setModalOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteIncome(income._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredIncomes.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No income records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <IncomeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedIncome(null);
        }}
        income={selectedIncome}
        onSave={handleSaveIncome}
      />
    </div>
  );
};

export default Income;