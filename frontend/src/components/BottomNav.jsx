import React from 'react';
import { Home, DollarSign, CheckSquare, ShoppingCart, TrendingUp, User } from 'lucide-react';

const navItems = [
  { id: 'overview', icon: Home, label: 'Home' },
  { id: 'expenses', icon: DollarSign, label: 'Expenses' },
  { id: 'chores', icon: CheckSquare, label: 'Chores' },
  { id: 'shopping', icon: ShoppingCart, label: 'Shopping' },
  { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
  { id: 'profile', icon: User, label: 'Profile' },
];

const BottomNav = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              activeTab === item.id
                ? 'text-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
