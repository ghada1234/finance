import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Camera, 
  Trash2, 
  Edit,
  X,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = {
  income: ['salary', 'freelance', 'investment', 'other_income'],
  expense: ['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'shopping', 'rent', 'education', 'other_expense']
};

const Transactions = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });

  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const { data } = await api.get(`/transactions?${params.toString()}`);
      setTransactions(data.transactions);
    } catch (error) {
      toast.error('Failed to load transactions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, formData);
        toast.success('Transaction updated!');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction added!');
        await refreshUser();
      }
      
      setShowModal(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      if (error.response?.data?.needsUpgrade) {
        toast.error('Transaction limit reached. Please upgrade your plan!');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save transaction');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted!');
      await refreshUser();
      loadTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd')
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingId(null);
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/transactions/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`Imported ${data.imported} transactions!`);
      if (data.errors) {
        toast.error(`${data.errors.length} rows had errors`);
      }
      
      await refreshUser();
      loadTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'CSV import failed');
    }

    e.target.value = '';
  };

  const handleReceiptScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);

    toast.loading('Scanning receipt with AI...');

    try {
      const { data } = await api.post('/transactions/scan-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.dismiss();
      toast.success('Receipt scanned successfully!');
      await refreshUser();
      loadTransactions();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Receipt scan failed');
    }

    e.target.value = '';
  };

  const downloadCSVTemplate = () => {
    const template = 'type,category,amount,description,date\nexpense,food,25.50,Lunch,2024-01-01\nincome,salary,5000,Monthly Salary,2024-01-01';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage your income and expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="w-4 h-4 mr-2 inline" />
            Import CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleCSVImport}
              className="hidden"
            />
          </label>
          
          <label className="btn btn-secondary cursor-pointer">
            <Camera className="w-4 h-4 mr-2 inline" />
            Scan Receipt
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleReceiptScan}
              className="hidden"
            />
          </label>

          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input max-w-xs"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input max-w-xs"
          >
            <option value="">All Categories</option>
            {[...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="input max-w-xs"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="input max-w-xs"
            placeholder="End Date"
          />

          {(filters.type || filters.category || filters.startDate || filters.endDate) && (
            <button
              onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={downloadCSVTemplate}
            className="ml-auto text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            CSV Template
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 capitalize">
                      {transaction.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transactions found</p>
            <p className="text-sm mt-2">Add your first transaction to get started!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                  className="input"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES[formData.type].map(cat => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Transaction
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

