import React, { useState, useEffect } from 'react';
import { Home, Users, DollarSign, CheckSquare, Bell, Settings, LogOut, Plus, X, Trash2, AlertCircle, TrendingUp, PieChart } from 'lucide-react';
import { expensesAPI, choresAPI } from '../services/api';
import { toast } from 'react-toastify';
const Dashboard = ({ setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddChoreModal, setShowAddChoreModal] = useState(false);
  const [showAddRoommateModal, setShowAddRoommateModal] = useState(false);
  
  // Sample data - will be replaced with backend
  const [currentUser] = useState({ id: 1, name: 'John Doe', email: 'john@example.com' });
  const [roommates, setRoommates] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'JD', role: 'admin' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', avatar: 'SS', role: 'member' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', avatar: 'MJ', role: 'member' }
  ]);
  
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Electricity Bill', amount: 150, paidBy: 1, paidByName: 'John Doe', date: '2025-10-10', category: 'utilities', splitWith: [1, 2, 3] },
    { id: 2, description: 'Groceries', amount: 85, paidBy: 2, paidByName: 'Sarah Smith', date: '2025-10-12', category: 'food', splitWith: [1, 2, 3] },
    { id: 3, description: 'Internet Bill', amount: 60, paidBy: 3, paidByName: 'Mike Johnson', date: '2025-10-08', category: 'utilities', splitWith: [1, 2, 3] }
  ]);
  
  const [chores, setChores] = useState([
    { id: 1, title: 'Clean Kitchen', assignedTo: 1, assignedToName: 'John Doe', dueDate: '2025-10-16', completed: false, priority: 'high' },
    { id: 2, title: 'Take Out Trash', assignedTo: 2, assignedToName: 'Sarah Smith', dueDate: '2025-10-15', completed: true, priority: 'medium' },
    { id: 3, title: 'Vacuum Living Room', assignedTo: 3, assignedToName: 'Mike Johnson', dueDate: '2025-10-17', completed: false, priority: 'low' }
  ]);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: 1,
    date: new Date().toISOString().split('T')[0],
    category: 'utilities',
    splitWith: [1]
  });

  const [newChore, setNewChore] = useState({
    title: '',
    assignedTo: 1,
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium'
  });

  const [newRoommate, setNewRoommate] = useState({
    name: '',
    email: ''
  });

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch expenses
        const expensesData = await expensesAPI.getAllExpenses();
        if (expensesData.success) {
          setExpenses(expensesData.expenses);
        }

        // Fetch chores
        const choresData = await choresAPI.getAllChores();
        if (choresData.success) {
          setChores(choresData.chores);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setIsAuthenticated(false);
    }
  };

  const calculateBalances = () => {
    const balances = {};
    roommates.forEach(rm => {
      balances[rm.id] = { name: rm.name, paid: 0, owes: 0, balance: 0 };
    });

    expenses.forEach(expense => {
      const splitCount = expense.splitWith.length;
      const amountPerPerson = expense.amount / splitCount;
      
      balances[expense.paidBy].paid += expense.amount;
      
      expense.splitWith.forEach(personId => {
        balances[personId].owes += amountPerPerson;
      });
    });

    Object.keys(balances).forEach(id => {
      balances[id].balance = balances[id].paid - balances[id].owes;
    });

    return balances;
  };

  const addExpense = async () => {
  if (!newExpense.description || !newExpense.amount) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    const paidByName = roommates.find(r => r.id === parseInt(newExpense.paidBy))?.name;
    const expenseData = {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      paidBy: parseInt(newExpense.paidBy),
      paidByName,
      splitWith: newExpense.splitWith.map(id => parseInt(id))
    };

    const response = await expensesAPI.addExpense(expenseData);
    
    if (response.success) {
      setExpenses([response.expense, ...expenses]);
      toast.success('Expense added successfully!');
      setShowAddExpenseModal(false);
      setNewExpense({
        description: '',
        amount: '',
        paidBy: 1,
        date: new Date().toISOString().split('T')[0],
        category: 'utilities',
        splitWith: [1]
      });
    }
  } catch (error) {
    console.error('Error adding expense:', error);
    toast.error('Failed to add expense');
  }
};

 const addChore = async () => {
  if (!newChore.title) {
    toast.error('Please enter a chore title');
    return;
  }

  try {
    const assignedToName = roommates.find(r => r.id === parseInt(newChore.assignedTo))?.name;
    const choreData = {
      ...newChore,
      assignedTo: parseInt(newChore.assignedTo),
      assignedToName,
    };

    const response = await choresAPI.addChore(choreData);
    
    if (response.success) {
      setChores([...chores, response.chore]);
      toast.success('Chore added successfully!');
      setShowAddChoreModal(false);
      setNewChore({
        title: '',
        assignedTo: 1,
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium'
      });
    }
  } catch (error) {
    console.error('Error adding chore:', error);
    toast.error('Failed to add chore');
  }
};

  const addRoommate = () => {
    if (!newRoommate.name || !newRoommate.email) {
      alert('Please fill in all fields');
      return;
    }

    const roommate = {
      id: Date.now(),
      ...newRoommate,
      avatar: newRoommate.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      role: 'member'
    };

    setRoommates([...roommates, roommate]);
    setShowAddRoommateModal(false);
    setNewRoommate({ name: '', email: '' });
  };

  const toggleChore = async (choreId) => {
  try {
    const response = await choresAPI.toggleChore(choreId);
    if (response.success) {
      setChores(chores.map(chore => 
        chore.id === choreId ? response.chore : chore
      ));
      toast.success(response.chore.completed ? 'Chore completed!' : 'Chore reopened!');
    }
  } catch (error) {
    console.error('Error toggling chore:', error);
    toast.error('Failed to update chore');
  }
};

  const deleteExpense = async (expenseId) => {
  if (window.confirm('Delete this expense?')) {
    try {
      const response = await expensesAPI.deleteExpense(expenseId);
      if (response.success) {
        setExpenses(expenses.filter(e => e.id !== expenseId));
        toast.success('Expense deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  }
};
const deleteChore = async (choreId) => {
  if (window.confirm('Delete this chore?')) {
    try {
      const response = await choresAPI.deleteChore(choreId);
      if (response.success) {
        setChores(chores.filter(c => c.id !== choreId));
        toast.success('Chore deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting chore:', error);
      toast.error('Failed to delete chore');
    }
  }
};
 const removeRoommate = (roommateId) => {
    if (window.confirm('Remove this roommate?')) {
      setRoommates(roommates.filter(r => r.id !== roommateId));
    }
  };


  const toggleSplitWith = (roommateId) => {
    setNewExpense(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(roommateId)
        ? prev.splitWith.filter(id => id !== roommateId)
        : [...prev.splitWith, roommateId]
    }));
  };

  const balances = calculateBalances();
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const completedChores = chores.filter(c => c.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-64 h-64 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-blue-500 relative z-10" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Roommate Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-blue-400 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="text-gray-300 hover:text-blue-400 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-400 transition-colors flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-gray-900 p-2 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'
            }`}
          >
            <PieChart className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'expenses'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'
            }`}
          >
            <DollarSign className="h-4 w-4 inline mr-2" />
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('chores')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'chores'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'
            }`}
          >
            <CheckSquare className="h-4 w-4 inline mr-2" />
            Chores
          </button>
          <button
            onClick={() => setActiveTab('roommates')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'roommates'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Roommates
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 border border-blue-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Expenses</p>
                    <p className="text-3xl font-bold text-white mt-2">${totalExpenses.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-blue-400" />
                </div>
              </div>
              <div className="bg-gray-900 border border-cyan-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completed Chores</p>
                    <p className="text-3xl font-bold text-white mt-2">{completedChores}/{chores.length}</p>
                  </div>
                  <CheckSquare className="h-12 w-12 text-cyan-400" />
                </div>
              </div>
              <div className="bg-gray-900 border border-blue-400 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(96, 165, 250, 0.2)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Roommates</p>
                    <p className="text-3xl font-bold text-white mt-2">{roommates.length}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Balances */}
            <div className="bg-gray-900 border border-blue-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
                Current Balances
              </h2>
              <div className="space-y-3">
                {Object.values(balances).map((balance, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <span className="text-gray-300">{balance.name}</span>
                    <span className={`font-bold ${balance.balance > 0 ? 'text-green-400' : balance.balance < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {balance.balance > 0 ? '+' : ''}${balance.balance.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-blue-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
                <h3 className="text-lg font-bold text-white mb-4">Recent Expenses</h3>
                <div className="space-y-3">
                  {expenses.slice(0, 3).map(expense => (
                    <div key={expense.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{expense.description}</p>
                          <p className="text-gray-400 text-sm">{expense.paidByName}</p>
                        </div>
                        <span className="text-blue-400 font-bold">${expense.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-cyan-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}>
                <h3 className="text-lg font-bold text-white mb-4">Upcoming Chores</h3>
                <div className="space-y-3">
                  {chores.filter(c => !c.completed).slice(0, 3).map(chore => (
                    <div key={chore.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{chore.title}</p>
                          <p className="text-gray-400 text-sm">{chore.assignedToName}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          chore.priority === 'high' ? 'bg-red-900 text-red-300' :
                          chore.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {chore.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Expenses</h2>
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
              </button>
            </div>

            <div className="space-y-4">
              {expenses.map(expense => (
                <div key={expense.id} className="bg-gray-900 border border-blue-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)' }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{expense.description}</h3>
                      <p className="text-gray-400 text-sm mt-1">Paid by {expense.paidByName} on {expense.date}</p>
                      <p className="text-blue-400 text-sm mt-1">Split between {expense.splitWith.length} people</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-blue-400">${expense.amount.toFixed(2)}</span>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chores Tab */}
        {activeTab === 'chores' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Chores</h2>
              <button
                onClick={() => setShowAddChoreModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Chore
              </button>
            </div>

            <div className="space-y-4">
              {chores.map(chore => (
                <div key={chore.id} className={`bg-gray-900 border rounded-xl p-6 ${
                  chore.completed ? 'border-green-500 opacity-75' : 'border-cyan-500'
                }`} style={{ boxShadow: `0 0 15px ${chore.completed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 211, 238, 0.15)'}` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleChore(chore.id)}
                        className={`mt-1 ${chore.completed ? 'text-green-400' : 'text-gray-600'}`}
                      >
                        {chore.completed ? <CheckSquare className="h-6 w-6" /> : <div className="h-6 w-6 border-2 border-gray-600 rounded"></div>}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${chore.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {chore.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Assigned to {chore.assignedToName} â€¢ Due {chore.dueDate}
                        </p>
                        <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                          chore.priority === 'high' ? 'bg-red-900 text-red-300' :
                          chore.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {chore.priority}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChore(chore.id)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-3"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roommates Tab */}
        {activeTab === 'roommates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Roommates</h2>
              <button
                onClick={() => setShowAddRoommateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Roommate
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {roommates.map(roommate => (
                <div key={roommate.id} className="bg-gray-900 border border-blue-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {roommate.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{roommate.name}</h3>
                        <p className="text-gray-400 text-sm">{roommate.email}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${
                          roommate.role === 'admin' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {roommate.role}
                        </span>
                      </div>
                    </div>
                    {roommate.id !== currentUser.id && (
                      <button
                        onClick={() => removeRoommate(roommate.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-blue-500 rounded-xl p-6 w-full max-w-md" style={{ boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add Expense</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Electricity Bill"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Paid By</label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) => setNewExpense({ ...newExpense, paidBy: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="utilities">Utilities</option>
                  <option value="food">Food</option>
                  <option value="rent">Rent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Split With</label>
                <div className="space-y-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                  {roommates.map(rm => (
                    <label key={rm.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExpense.splitWith.includes(rm.id)}
                        onChange={() => toggleSplitWith(rm.id)}
                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">{rm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={addExpense}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Chore Modal */}
      {showAddChoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-cyan-500 rounded-xl p-6 w-full max-w-md" style={{ boxShadow: '0 0 40px rgba(34, 211, 238, 0.5)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add Chore</h3>
              <button onClick={() => setShowAddChoreModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newChore.title}
                  onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., Clean Kitchen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign To</label>
                <select
                  value={newChore.assignedTo}
                  onChange={(e) => setNewChore({ ...newChore, assignedTo: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                >
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={newChore.dueDate}
                  onChange={(e) => setNewChore({ ...newChore, dueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={newChore.priority}
                  onChange={(e) => setNewChore({ ...newChore, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                onClick={addChore}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
              >
                Add Chore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Roommate Modal */}
      {showAddRoommateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-blue-500 rounded-xl p-6 w-full max-w-md" style={{ boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add Roommate</h3>
              <button onClick={() => setShowAddRoommateModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newRoommate.name}
                  onChange={(e) => setNewRoommate({ ...newRoommate, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newRoommate.email}
                  onChange={(e) => setNewRoommate({ ...newRoommate, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
                <p className="text-blue-300 text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  An invitation link will be sent to this email address.
                </p>
              </div>
              <button
                onClick={addRoommate}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;