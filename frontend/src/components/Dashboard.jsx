import React, { useState, useEffect, useCallback } from 'react';
import { Home, Users, DollarSign, CheckSquare, Bell, LogOut, Plus, X, Trash2, TrendingUp, ShoppingCart, User, Send } from 'lucide-react';
import { expensesAPI, choresAPI, usersAPI, balancesAPI, settlementsAPI, shoppingAPI, notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import Avatar from './Avatar';
import EmptyState from './EmptyState';
import SkeletonCard from './SkeletonCard';
import ConfirmModal from './ConfirmModal';
import AnalyticsPage from './AnalyticsPage';
import BottomNav from './BottomNav';

const Dashboard = ({ setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [chores, setChores] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddChoreModal, setShowAddChoreModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Expense form
  const [newExpense, setNewExpense] = useState({
    description: '', amount: '', paidBy: '', date: new Date().toISOString().split('T')[0],
    category: 'utilities', customCategory: '', splitType: 'equal', splits: [], splitWith: []
  });

  // Chore form
  const [newChore, setNewChore] = useState({
    title: '', assignedTo: '', customAssignee: '', dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium', isRecurring: false, recurringFrequency: 'weekly', rotationOrder: []
  });

  // Settlement form
  const [newSettlement, setNewSettlement] = useState({ from: '', to: '', amount: '', note: '' });

  // Shopping form
  const [newShoppingItem, setNewShoppingItem] = useState('');

  // ─── Fetch all data ───
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('user');
      if (stored) setCurrentUser(JSON.parse(stored));

      const [usersData, expensesData, choresData, balData, settleData, shopData, notifData] = await Promise.allSettled([
        usersAPI.getAllUsers(), expensesAPI.getAllExpenses(), choresAPI.getAllChores(),
        balancesAPI.getBalances(), settlementsAPI.getAll(), shoppingAPI.getAll(), notificationsAPI.getAll()
      ]);

      if (usersData.status === 'fulfilled') {
        const list = Array.isArray(usersData.value) ? usersData.value : [];
        setRoommates(list);
      }
      if (expensesData.status === 'fulfilled' && expensesData.value.success) setExpenses(expensesData.value.expenses);
      if (choresData.status === 'fulfilled' && choresData.value.success) setChores(choresData.value.chores);
      if (balData.status === 'fulfilled' && balData.value.success) setBalances(balData.value.balances);
      if (settleData.status === 'fulfilled' && settleData.value.success) setSettlements(settleData.value.settlements);
      if (shopData.status === 'fulfilled' && shopData.value.success) setShoppingItems(shopData.value.items);
      if (notifData.status === 'fulfilled' && notifData.value.success) {
        setNotifications(notifData.value.notifications);
        setUnreadCount(notifData.value.notifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Handlers ───
  const handleLogout = () => { setIsAuthenticated(); };

  // Add Expense with smart splitting
  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast.error('Please fill in all required fields'); return;
    }
    try {
      const paidById = Number(newExpense.paidBy);
      const paidByName = roommates.find(r => r.id === paidById)?.name || currentUser?.firstName + ' ' + currentUser?.lastName;
      const category = newExpense.category === 'other' ? newExpense.customCategory : newExpense.category;

      let splits = [];
      if (newExpense.splitType === 'equal') {
        const allIds = [...new Set([...newExpense.splitWith, paidById])];
        splits = allIds.map(userId => ({ userId, value: 0 }));
      } else if (newExpense.splitType === 'percentage' || newExpense.splitType === 'custom') {
        splits = newExpense.splits.map(s => ({ userId: s.userId, value: Number(s.value) }));
      }

      const data = await expensesAPI.addExpense({
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        paidBy: paidById,
        paidByName,
        category,
        date: newExpense.date,
        splitType: newExpense.splitType,
        splits
      });

      if (data.success) {
        setExpenses([data.expense, ...expenses]);
        toast.success('Expense added!');
        setShowAddExpenseModal(false);
        resetExpenseForm();
        fetchData();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add expense');
    }
  };

  const resetExpenseForm = () => {
    setNewExpense({
      description: '', amount: '', paidBy: currentUser?.id || '', date: new Date().toISOString().split('T')[0],
      category: 'utilities', customCategory: '', splitType: 'equal', splits: [], splitWith: []
    });
  };

  // Add Chore
  const addChore = async () => {
    if (!newChore.title) { toast.error('Please enter a chore title'); return; }
    try {
      const assignedToId = newChore.assignedTo === 'other' ? null : Number(newChore.assignedTo);
      const assignedToName = newChore.assignedTo === 'other' ? newChore.customAssignee : roommates.find(r => r.id === assignedToId)?.name;
      const data = await choresAPI.addChore({
        title: newChore.title,
        description: newChore.description,
        assignedTo: assignedToId,
        assignedToName,
        dueDate: newChore.dueDate,
        priority: newChore.priority,
        isRecurring: newChore.isRecurring,
        recurringFrequency: newChore.isRecurring ? newChore.recurringFrequency : null,
        rotationOrder: newChore.isRecurring ? newChore.rotationOrder : null,
      });
      if (data.success) {
        setChores([data.chore, ...chores]);
        toast.success('Chore added!');
        setShowAddChoreModal(false);
        setNewChore({
          title: '', description: '', assignedTo: '', customAssignee: '', dueDate: new Date().toISOString().split('T')[0],
          priority: 'medium', isRecurring: false, recurringFrequency: 'weekly', rotationOrder: []
        });
      }
    } catch (error) {
      toast.error('Failed to add chore');
    }
  };

  // Toggle Chore
  const toggleChore = async (choreId) => {
    try {
      const data = await choresAPI.toggleChore(choreId);
      if (data.success) {
        setChores(chores.map(c => c.id === choreId ? data.chore : c));
        toast.success(data.chore.completed ? '✅ Chore completed!' : 'Chore reopened');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update chore');
    }
  };

  // Delete with confirm modal
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      if (confirmDelete.type === 'expense') {
        const data = await expensesAPI.deleteExpense(confirmDelete.id);
        if (data.success) {
          setExpenses(expenses.filter(e => e.id !== confirmDelete.id));
          toast.success('Expense deleted');
        }
      } else if (confirmDelete.type === 'chore') {
        const data = await choresAPI.deleteChore(confirmDelete.id);
        if (data.success) {
          setChores(chores.filter(c => c.id !== confirmDelete.id));
          toast.success('Chore deleted');
        }
      } else if (confirmDelete.type === 'shopping') {
        const data = await shoppingAPI.delete(confirmDelete.id);
        if (data.success) {
          setShoppingItems(shoppingItems.filter(i => i.id !== confirmDelete.id));
          toast.success('Item deleted');
        }
      }
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  // Settlements
  const addSettlement = async () => {
    if (!newSettlement.from || !newSettlement.to || !newSettlement.amount) {
      toast.error('Please fill all fields'); return;
    }
    try {
      const data = await settlementsAPI.create({
        from: Number(newSettlement.from),
        to: Number(newSettlement.to),
        amount: Number(newSettlement.amount),
        note: newSettlement.note
      });
      if (data.success) {
        toast.success('Settlement recorded!');
        setShowSettleModal(false);
        setNewSettlement({ from: '', to: '', amount: '', note: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to record settlement');
    }
  };

  // Shopping
  const addShoppingItem = async () => {
    if (!newShoppingItem.trim()) { toast.error('Enter item name'); return; }
    try {
      const data = await shoppingAPI.add({ name: newShoppingItem, addedBy: currentUser?.id || 1 });
      if (data.success) {
        setShoppingItems([data.item, ...shoppingItems]);
        setNewShoppingItem('');
        toast.success('Item added');
      }
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const toggleShoppingItem = async (id) => {
    try {
      const data = await shoppingAPI.toggle(id, currentUser?.id);
      if (data.success) {
        setShoppingItems(shoppingItems.map(i => i.id === id ? { ...i, isChecked: data.item.isChecked } : i));
      }
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  // Notifications
  const markNotifRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // ─── Computed ───
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const completedChores = chores.filter(c => c.completed).length;

  // ─── Split helpers ───
  const handleSplitTypeChange = (type) => {
    setNewExpense(prev => {
      const allInvolved = [...new Set([...prev.splitWith, Number(prev.paidBy)])];
      let splits = allInvolved.map(userId => {
        const existing = prev.splits.find(s => s.userId === userId);
        return { userId, value: existing?.value || 0 };
      });
      if (type === 'equal') splits = [];
      return { ...prev, splitType: type, splits };
    });
  };

  const updateSplitValue = (userId, value) => {
    setNewExpense(prev => {
      const splits = [...(prev.splits || [])];
      const idx = splits.findIndex(s => s.userId === userId);
      if (idx >= 0) splits[idx] = { ...splits[idx], value: Number(value) };
      else splits.push({ userId, value: Number(value) });
      return { ...prev, splits };
    });
  };

  const toggleSplitWith = (userId) => {
    setNewExpense(prev => {
      const splitWith = prev.splitWith.includes(userId)
        ? prev.splitWith.filter(id => id !== userId)
        : [...prev.splitWith, userId];
      return { ...prev, splitWith };
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#DDDDDD] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="badge-air mr-3">
                <Home className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-[#222222]">Cohabit</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="text-[#717171] hover:text-[#222222] transition-colors relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifPanel && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-air shadow-air-lg z-50 max-h-96 overflow-y-auto border border-[#DDDDDD]">
                    <div className="flex justify-between items-center p-3 border-b border-[#DDDDDD]">
                      <span className="text-[#222222] font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-coral-500 hover:text-coral-600 font-medium">Mark all read</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-[#717171] text-sm text-center py-8">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div key={n.id} className={`p-3 border-b border-[#DDDDDD] cursor-pointer hover:bg-[#F7F7F7] transition-colors ${!n.isRead ? 'bg-coral-50' : ''}`}
                          onClick={() => markNotifRead(n.id)}>
                          <p className="text-sm text-[#222222]">{n.message}</p>
                          <p className="text-xs text-[#717171] mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {/* Profile */}
              <button onClick={() => setActiveTab('profile')} className="transition-colors">
                <Avatar name={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`} size="sm" />
              </button>
              <button onClick={handleLogout} className="text-[#717171] hover:text-coral-500 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative pb-20 md:pb-8">
        {/* Desktop Tab Navigation */}
        <div className="hidden md:flex space-x-2 mb-8 bg-white p-1.5 rounded-pill shadow-air-sm border border-[#DDDDDD]">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'expenses', icon: DollarSign, label: 'Expenses' },
            { id: 'chores', icon: CheckSquare, label: 'Chores' },
            { id: 'shopping', icon: ShoppingCart, label: 'Shopping' },
            { id: 'roommates', icon: Users, label: 'Roommates' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-pill font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-coral-500 text-white shadow-air-sm'
                  : 'text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]'
              }`}>
              <tab.icon className="h-4 w-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
            <SkeletonCard />
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonCard /><SkeletonCard />
            </div>
          </div>
        ) : (<>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-air p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#717171] text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold text-[#222222] mt-2">${totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="badge-air">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="card-air p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#717171] text-sm font-medium">Completed Chores</p>
                    <p className="text-3xl font-bold text-[#222222] mt-2">{completedChores}/{chores.length}</p>
                  </div>
                  <div className="badge-air">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="card-air p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#717171] text-sm font-medium">Active Roommates</p>
                    <p className="text-3xl font-bold text-[#222222] mt-2">{roommates.length}</p>
                  </div>
                  <div className="badge-air">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Balances */}
            <div className="card-air p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#222222] flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-coral-500" />
                  Current Balances
                </h2>
                <button onClick={() => setShowSettleModal(true)}
                  className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-pill text-sm font-semibold transition-all shadow-air-sm hover:shadow-air flex items-center">
                  <Send className="h-4 w-4 mr-1" /> Settle Up
                </button>
              </div>
              <div className="space-y-3">
                {balances.length === 0 ? (
                  <EmptyState title="No balances yet" description="Add expenses to see who owes what" />
                ) : (
                  balances.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#F7F7F7] p-4 rounded-xl transition-all duration-200 hover:shadow-air-sm">
                      <div className="flex items-center space-x-3">
                        <Avatar name={b.name} size="sm" />
                        <span className="text-[#222222] font-medium">{b.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`font-bold ${Number(b.balance) > 0 ? 'text-emerald-600' : Number(b.balance) < 0 ? 'text-coral-500' : 'text-[#717171]'}`}>
                          {Number(b.balance) > 0 ? '+' : ''}₹{Number(b.balance).toFixed(2)}
                        </span>
                        {Number(b.balance) < 0 && (
                          <button onClick={() => { setNewSettlement({ from: b.userId, to: '', amount: Math.abs(b.balance).toFixed(2), note: '' }); setShowSettleModal(true); }}
                            className="text-xs text-coral-500 hover:text-coral-600 font-semibold">Pay</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-air p-6">
                <h3 className="text-lg font-bold text-[#222222] mb-4">Recent Expenses</h3>
                {expenses.length === 0 ? (
                  <EmptyState title="No expenses yet" description="Add your first expense to get started" actionLabel="Add Expense" onAction={() => setShowAddExpenseModal(true)} />
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map(expense => (
                      <div key={expense.id} className="bg-[#F7F7F7] p-3 rounded-xl transition-all duration-200 hover:shadow-air-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Avatar name={expense.paidByName} size="sm" />
                            <div>
                              <p className="text-[#222222] font-medium">{expense.description}</p>
                              <p className="text-[#717171] text-sm">{expense.paidByName}</p>
                            </div>
                          </div>
                          <span className="text-coral-500 font-bold">₹{Number(expense.amount).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-air p-6">
                <h3 className="text-lg font-bold text-[#222222] mb-4">Upcoming Chores</h3>
                {chores.filter(c => !c.completed).length === 0 ? (
                  <EmptyState title="All chores done!" description="No pending chores. Great work!" />
                ) : (
                  <div className="space-y-3">
                    {chores.filter(c => !c.completed).slice(0, 5).map(chore => (
                      <div key={chore.id} className="bg-[#F7F7F7] p-3 rounded-xl transition-all duration-200 hover:shadow-air-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Avatar name={chore.assignedToName} size="sm" />
                            <div>
                              <p className="text-[#222222] font-medium">{chore.title}</p>
                              <p className="text-[#717171] text-sm">{chore.assignedToName}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-pill font-medium ${
                            chore.priority === 'high' ? 'bg-red-50 text-red-600' :
                            chore.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {chore.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#222222]">Expenses</h2>
              <button onClick={() => setShowAddExpenseModal(true)}
                className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2.5 rounded-pill font-semibold transition-all shadow-air-sm hover:shadow-air flex items-center">
                <Plus className="h-5 w-5 mr-2" /> Add Expense
              </button>
            </div>
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <EmptyState icon={DollarSign} title="No expenses yet" description="Add your first expense to start tracking" actionLabel="Add Expense" onAction={() => setShowAddExpenseModal(true)} />
              ) : expenses.map(expense => (
                <div key={expense.id} className="card-air p-6 transition-all duration-200 hover:shadow-air-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar name={expense.paidByName} />
                      <div>
                        <h3 className="text-lg font-bold text-[#222222]">{expense.description}</h3>
                        <p className="text-[#717171] text-sm mt-1">Paid by {expense.paidByName} on {expense.date}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-coral-50 text-coral-600 px-2 py-0.5 rounded-pill font-medium">{expense.splitType || 'equal'}</span>
                          <span className="text-xs bg-[#F7F7F7] text-[#717171] px-2 py-0.5 rounded-pill">{expense.category}</span>
                          {expense.receiptUrl && <span className="text-xs text-coral-500">📎 Receipt</span>}
                        </div>
                        {expense.splits && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {expense.splits.map(s => (
                              <span key={s.userId} className="text-xs text-[#717171] bg-[#F7F7F7] px-2 py-0.5 rounded-pill">
                                {s.firstName} {s.lastName}: ₹{Number(s.amount).toFixed(2)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-coral-500">₹{Number(expense.amount).toFixed(2)}</span>
                      <button onClick={() => setConfirmDelete({ type: 'expense', id: expense.id })}
                        className="text-[#717171] hover:text-coral-500 transition-colors">
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
              <h2 className="text-2xl font-bold text-[#222222]">Chores</h2>
              <button onClick={() => setShowAddChoreModal(true)}
                className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2.5 rounded-pill font-semibold transition-all shadow-air-sm hover:shadow-air flex items-center">
                <Plus className="h-5 w-5 mr-2" /> Add Chore
              </button>
            </div>
            <div className="space-y-4">
              {chores.length === 0 ? (
                <EmptyState icon={CheckSquare} title="No chores yet" description="Add your first chore" actionLabel="Add Chore" onAction={() => setShowAddChoreModal(true)} />
              ) : chores.map(chore => (
                <div key={chore.id} className={`card-air p-6 transition-all duration-200 ${
                  chore.completed ? 'opacity-60' : ''
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <button onClick={() => toggleChore(chore.id)}
                        className={`mt-1 transition-all duration-200 active:scale-90 ${chore.completed ? 'text-emerald-500' : 'text-[#DDDDDD] hover:text-coral-400'}`}>
                        {chore.completed ? <CheckSquare className="h-6 w-6" /> : <div className="h-6 w-6 border-2 border-[#DDDDDD] rounded-lg hover:border-coral-400"></div>}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Avatar name={chore.assignedToName} size="sm" />
                          <h3 className={`text-lg font-bold ${chore.completed ? 'line-through text-[#717171]' : 'text-[#222222]'}`}>
                            {chore.title}
                          </h3>
                        </div>
                        <p className="text-[#717171] text-sm mt-1 ml-10">
                          Assigned to {chore.assignedToName} • Due {chore.dueDate}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 ml-10">
                          <span className={`text-xs px-3 py-0.5 rounded-pill font-medium ${
                            chore.priority === 'high' ? 'bg-red-50 text-red-600' :
                            chore.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>{chore.priority}</span>
                          {chore.isRecurring && <span className="text-xs bg-coral-50 text-coral-600 px-3 py-0.5 rounded-pill font-medium">🔄 {chore.recurringFrequency}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setConfirmDelete({ type: 'chore', id: chore.id })}
                      className="text-[#717171] hover:text-coral-500 transition-colors ml-3">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#222222] flex items-center"><ShoppingCart className="h-6 w-6 mr-2 text-coral-500" /> Shopping List</h2>
            </div>
            <div className="card-air p-6 mb-6">
              <div className="flex space-x-3">
                <input type="text" value={newShoppingItem} onChange={e => setNewShoppingItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addShoppingItem()}
                  className="flex-1 px-4 py-3 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none placeholder-[#999999]"
                  placeholder="Add item to shopping list..." />
                <button onClick={addShoppingItem}
                  className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-pill font-semibold transition-all shadow-air-sm">Add</button>
              </div>
            </div>
            <div className="space-y-3">
              {shoppingItems.length === 0 ? (
                <EmptyState icon={ShoppingCart} title="Shopping list empty" description="Add items you need to buy" />
              ) : shoppingItems.map(item => (
                <div key={item.id} className="card-air p-4 flex items-center justify-between transition-all duration-200 hover:shadow-air-lg">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => toggleShoppingItem(item.id)}
                      className={`transition-all duration-200 active:scale-90 ${item.isChecked ? 'text-emerald-500' : 'text-[#DDDDDD] hover:text-coral-400'}`}>
                      {item.isChecked ? <CheckSquare className="h-6 w-6" /> : <div className="h-6 w-6 border-2 border-[#DDDDDD] rounded-lg"></div>}
                    </button>
                    <div>
                      <p className={`text-[#222222] font-medium ${item.isChecked ? 'line-through text-[#717171]' : ''}`}>{item.name}</p>
                      <p className="text-[#717171] text-xs">Added by {item.addedByFirstName} {item.addedByLastName}</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmDelete({ type: 'shopping', id: item.id })}
                    className="text-[#717171] hover:text-coral-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roommates Tab */}
        {activeTab === 'roommates' && (
          <div>
            <h2 className="text-2xl font-bold text-[#222222] mb-6 flex items-center"><Users className="h-6 w-6 mr-2 text-coral-500" /> Roommates</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {roommates.length === 0 ? (
                <EmptyState icon={Users} title="No roommates yet" description="Invite your roommates to join your house" />
              ) : roommates.map(rm => (
                <div key={rm.id} className="card-air p-6 transition-all duration-200 hover:shadow-air-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar name={`${rm.firstName || ''} ${rm.lastName || ''}`} size="lg" />
                    <div>
                      <h3 className="text-lg font-bold text-[#222222]">{rm.firstName} {rm.lastName}</h3>
                      <p className="text-[#717171] text-sm">{rm.email}</p>
                      {rm.upiId && <p className="text-coral-500 text-xs mt-1 font-medium">UPI: {rm.upiId}</p>}
                      <span className={`inline-block mt-1 text-xs px-3 py-0.5 rounded-pill font-medium ${
                        rm.role === 'admin' ? 'bg-coral-50 text-coral-600' : 'bg-[#F7F7F7] text-[#717171]'
                      }`}>{rm.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsPage />}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-[#222222] mb-6 flex items-center"><User className="h-6 w-6 mr-2 text-coral-500" /> Profile</h2>
            <div className="card-air p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar name={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`} size="xl" />
                <div>
                  <h3 className="text-xl font-bold text-[#222222]">{currentUser?.firstName} {currentUser?.lastName}</h3>
                  <p className="text-[#717171]">{currentUser?.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">UPI ID</label>
                <input type="text" value={currentUser?.upiId || ''} onChange={async (e) => {
                  const newUpi = e.target.value;
                  try {
                    const { authAPI } = await import('../services/api');
                    const res = await authAPI.updateProfile({ upiId: newUpi });
                    if (res.success) {
                      setCurrentUser(prev => ({ ...prev, upiId: newUpi }));
                      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), upiId: newUpi }));
                      toast.success('UPI ID updated');
                    }
                  } catch (err) { toast.error('Failed to update UPI ID'); }
                }}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none placeholder-[#999999]"
                  placeholder="example@paytm" />
              </div>
              <div className="border-t border-[#DDDDDD] pt-4">
                <h4 className="text-[#222222] font-semibold mb-3">Settlement History</h4>
                {settlements.length === 0 ? (
                  <p className="text-[#717171] text-sm">No settlements yet</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {settlements.map(s => (
                      <div key={s.id} className="bg-[#F7F7F7] p-3 rounded-xl text-sm">
                        <p className="text-[#222222]">{s.fromFirstName} {s.fromLastName} paid {s.toFirstName} {s.toLastName}</p>
                        <p className="text-coral-500 font-bold">₹{Number(s.amount).toFixed(2)}</p>
                        {s.note && <p className="text-[#717171] text-xs">{s.note}</p>}
                        <p className="text-[#999999] text-xs">{new Date(s.settledAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </>)}
      </div>

      {/* Bottom Navigation (mobile) */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ──────────────────────────────────────────────── */}
      {/* ADD EXPENSE MODAL (with Smart Splitting) */}
      {/* ──────────────────────────────────────────────── */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-air shadow-air-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#222222]">Add Expense</h3>
              <button onClick={() => { setShowAddExpenseModal(false); resetExpenseForm(); }} className="text-[#717171] hover:text-[#222222]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Description</label>
                <input type="text" value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none placeholder-[#999999]"
                  placeholder="e.g., Electricity Bill" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Amount (₹)</label>
                <input type="number" value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none placeholder-[#999999]"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Paid By</label>
                <select value={newExpense.paidBy}
                  onChange={(e) => { const pid = parseInt(e.target.value); setNewExpense({ ...newExpense, paidBy: pid }); }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.firstName || rm.name} {rm.lastName || ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                  <option value="utilities">Utilities</option>
                  <option value="food">Food</option>
                  <option value="rent">Rent</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="household">Household</option>
                  <option value="other">Other</option>
                </select>
                {newExpense.category === 'other' && (
                  <input type="text" value={newExpense.customCategory}
                    onChange={(e) => setNewExpense({ ...newExpense, customCategory: e.target.value })}
                    className="mt-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter category" />
                )}
              </div>

              {/* Split Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Split Type</label>
                <div className="flex space-x-2">
                  {[
                    { value: 'equal', label: 'Equal' },
                    { value: 'percentage', label: 'By %' },
                    { value: 'custom', label: 'Custom ₹' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => handleSplitTypeChange(opt.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        newExpense.splitType === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split With */}
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Split With</label>
                <div className="space-y-2 bg-[#F7F7F7] p-3 rounded-xl border border-[#DDDDDD]">
                  {roommates.filter(r => r.id !== Number(newExpense.paidBy)).map(rm => (
                    <label key={rm.id} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={newExpense.splitWith.includes(rm.id)}
                        onChange={() => toggleSplitWith(rm.id)}
                        className="rounded border-[#DDDDDD] text-coral-500 focus:ring-coral-500" />
                      <Avatar name={`${rm.firstName || ''} ${rm.lastName || ''}`} size="sm" />
                      <span className="text-[#222222]">{rm.firstName} {rm.lastName}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Split Values (for percentage/custom) */}
              {newExpense.splitType !== 'equal' && newExpense.splitWith.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#717171] mb-2">
                    {newExpense.splitType === 'percentage' ? 'Percentages' : 'Custom Amounts (₹)'}
                  </label>
                  <div className="space-y-2 bg-[#F7F7F7] p-3 rounded-xl border border-[#DDDDDD]">
                    {[...newExpense.splitWith, Number(newExpense.paidBy)].map(userId => {
                      const rm = roommates.find(r => r.id === userId);
                      if (!rm) return null;
                      const split = newExpense.splits?.find(s => s.userId === userId);
                      return (
                        <div key={userId} className="flex items-center justify-between">
                          <span className="text-[#222222] text-sm font-medium">{rm.firstName || rm.name} {rm.lastName || ''}</span>
                          <div className="flex items-center space-x-2">
                            <input type="number"
                              value={split?.value || 0}
                              onChange={(e) => updateSplitValue(userId, e.target.value)}
                              className="w-24 px-3 py-1.5 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] text-sm focus:border-[#222222] focus:outline-none text-right"
                              placeholder={newExpense.splitType === 'percentage' ? '%' : '₹'} />
                            {newExpense.splitType === 'percentage' && <span className="text-[#717171] text-sm">%</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button onClick={addExpense}
                className="w-full bg-coral-500 hover:bg-coral-600 text-white py-3 px-4 rounded-pill font-semibold transition-all shadow-air-sm hover:shadow-air active:scale-[0.97]">
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* ADD CHORE MODAL (with Recurring Support) */}
      {/* ──────────────────────────────────────────────── */}
      {showAddChoreModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-air shadow-air-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#222222]">Add Chore</h3>
              <button onClick={() => setShowAddChoreModal(false)} className="text-[#717171] hover:text-[#222222]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Title</label>
                <input type="text" value={newChore.title}
                  onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none"
                  placeholder="e.g., Clean Kitchen" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Assign To</label>
                <select value={newChore.assignedTo}
                  onChange={(e) => { const val = e.target.value; setNewChore({ ...newChore, assignedTo: val === 'other' ? 'other' : parseInt(val) }); }}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none">
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.firstName || rm.name} {rm.lastName || ''}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {newChore.assignedTo === 'other' && (
                  <input type="text" value={newChore.customAssignee}
                    onChange={(e) => setNewChore({ ...newChore, customAssignee: e.target.value })}
                    className="mt-2 w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none"
                    placeholder="Enter name" />
                )}
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between bg-[#F7F7F7] p-3 rounded-xl border border-[#DDDDDD]">
                <div>
                  <span className="text-[#222222] font-medium text-sm">Recurring Chore</span>
                  <p className="text-[#717171] text-xs mt-0.5">Auto-rotate between roommates</p>
                </div>
                <button onClick={() => setNewChore({ ...newChore, isRecurring: !newChore.isRecurring })}
                  className="w-11 h-6 rounded-full transition-colors flex items-center">
                  <div className={`w-full h-full rounded-full ${newChore.isRecurring ? 'bg-coral-500' : 'bg-[#DDDDDD]'} flex items-center`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-air-sm transition-transform ${newChore.isRecurring ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>

              {newChore.isRecurring && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#717171] mb-2">Frequency</label>
                    <select value={newChore.recurringFrequency}
                      onChange={(e) => setNewChore({ ...newChore, recurringFrequency: e.target.value })}
                      className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#717171] mb-2">Rotation Order</label>
                    <div className="space-y-2 bg-[#F7F7F7] p-3 rounded-xl border border-[#DDDDDD]">
                      {roommates.map(rm => (
                        <label key={rm.id} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox"
                            checked={newChore.rotationOrder.includes(rm.id)}
                            onChange={() => {
                              setNewChore(prev => ({
                                ...prev,
                                rotationOrder: prev.rotationOrder.includes(rm.id)
                                  ? prev.rotationOrder.filter(id => id !== rm.id)
                                  : [...prev.rotationOrder, rm.id]
                              }));
                            }}
                            className="rounded border-[#DDDDDD] text-coral-500 focus:ring-coral-500" />
                          <Avatar name={`${rm.firstName || ''} ${rm.lastName || ''}`} size="sm" />
                          <span className="text-[#222222]">{rm.firstName} {rm.lastName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Due Date</label>
                <input type="date" value={newChore.dueDate}
                  onChange={(e) => setNewChore({ ...newChore, dueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Priority</label>
                <select value={newChore.priority}
                  onChange={(e) => setNewChore({ ...newChore, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button onClick={addChore}
                className="w-full bg-coral-500 hover:bg-coral-600 text-white py-3 px-4 rounded-pill font-semibold transition-all shadow-air-sm hover:shadow-air active:scale-[0.97]">
                {newChore.isRecurring ? 'Add Recurring Chore' : 'Add Chore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* SETTLE UP MODAL */}
      {/* ──────────────────────────────────────────────── */}
      {showSettleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-air shadow-air-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#222222] flex items-center"><Send className="h-5 w-5 mr-2 text-coral-500" /> Settle Up</h3>
              <button onClick={() => { setShowSettleModal(false); setNewSettlement({ from: '', to: '', amount: '', note: '' }); }} className="text-[#717171] hover:text-[#222222]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Who is paying?</label>
                <select value={newSettlement.from}
                  onChange={(e) => setNewSettlement({ ...newSettlement, from: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none">
                  <option value="">Select person</option>
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.firstName || rm.name} {rm.lastName || ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Who is receiving?</label>
                <select value={newSettlement.to}
                  onChange={(e) => setNewSettlement({ ...newSettlement, to: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none">
                  <option value="">Select person</option>
                  {roommates.filter(r => r.id !== Number(newSettlement.from)).map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.firstName || rm.name} {rm.lastName || ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Amount (₹)</label>
                <input type="number" value={newSettlement.amount}
                  onChange={(e) => setNewSettlement({ ...newSettlement, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#717171] mb-2">Note (optional)</label>
                <input type="text" value={newSettlement.note}
                  onChange={(e) => setNewSettlement({ ...newSettlement, note: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-[#DDDDDD] rounded-xl text-[#222222] focus:border-[#222222] focus:outline-none"
                  placeholder="e.g., For dinner" />
              </div>
              {/* UPI Deep Link */}
              {newSettlement.from && newSettlement.to && newSettlement.amount && (
                <div className="bg-[#F7F7F7] rounded-xl p-3 border border-[#DDDDDD]">
                  <p className="text-[#717171] text-sm mb-2">Quick payment:</p>
                  {(() => {
                    const toRm = roommates.find(r => r.id === Number(newSettlement.to));
                    const upiId = toRm?.upiId;
                    if (upiId) {
                      const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(toRm.firstName || '')}&am=${Number(newSettlement.amount)}&cu=INR`;
                      return (
                        <a href={upiLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 bg-coral-500 hover:bg-coral-600 text-white py-2 rounded-pill font-semibold transition-colors">
                          <Send className="h-4 w-4" /> Pay via UPI
                        </a>
                      );
                    }
                    return <p className="text-[#717171] text-xs">{toRm?.firstName} hasn't set a UPI ID yet</p>;
                  })()}
                </div>
              )}
              <button onClick={addSettlement}
                className="w-full bg-coral-500 hover:bg-coral-600 text-white py-3 px-4 rounded-pill font-semibold transition-all shadow-air-sm hover:shadow-air active:scale-[0.97]">
                Record Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────── */}
      {/* CONFIRM DELETE MODAL */}
      {/* ──────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={`Delete ${confirmDelete?.type || 'item'}?`}
        message="This action cannot be undone."
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Dashboard;