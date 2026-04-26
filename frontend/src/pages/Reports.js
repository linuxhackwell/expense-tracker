import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CalendarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [period, year]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/analytics/reports?period=${period}&year=${year}`);
      setReportData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Visualize your financial data</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-field"
            >
              <option value="monthly">Monthly (Current Year)</option>
              <option value="weekly">Weekly (Last 4 Weeks)</option>
            </select>
          </div>
          
          {period === 'monthly' && (
            <div>
              <label className="label">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="input-field"
              >
                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Line Chart - Income vs Expenses */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Income vs Expenses {period === 'monthly' ? `(${year})` : '(Last 4 Weeks)'}
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Comparison
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ${reportData.reduce((sum, item) => sum + item.income, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            ${reportData.reduce((sum, item) => sum + item.expenses, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Net Savings</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">
            ${(reportData.reduce((sum, item) => sum + item.income, 0) - 
               reportData.reduce((sum, item) => sum + item.expenses, 0)).toFixed(2)}
          </p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly Expense</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            ${(reportData.reduce((sum, item) => sum + item.expenses, 0) / reportData.length).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Best & Worst Months */}
      {period === 'monthly' && reportData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Best Saving Month
            </h3>
            {(() => {
              const savings = reportData.map(item => ({
                period: item.period,
                savings: item.income - item.expenses
              }));
              const best = savings.reduce((max, item) => item.savings > max.savings ? item : max, savings[0]);
              return (
                <div>
                  <p className="text-3xl font-bold text-green-600">${best.savings.toFixed(2)}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{best.period}</p>
                </div>
              );
            })()}
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Highest Expense Month
            </h3>
            {(() => {
              const highestExpense = reportData.reduce((max, item) => 
                item.expenses > max.expenses ? item : max, reportData[0]);
              return (
                <div>
                  <p className="text-3xl font-bold text-red-600">${highestExpense.expenses.toFixed(2)}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{highestExpense.period}</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;