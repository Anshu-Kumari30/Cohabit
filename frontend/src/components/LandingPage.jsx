import React from 'react';
import { Home, DollarSign, CheckSquare, TrendingUp, ArrowRight, Github, Linkedin } from 'lucide-react';
import { authAPI } from '../services/api';

const LandingPage = ({ setIsAuthenticated, setShowAuth }) => {
  const handleDemoLogin = async () => {
    try {
      const data = await authAPI.demoLogin();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
      }
    } catch (err) {
      alert('Demo account not available. Please sign up or log in.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-gray-800 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Cohabit</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAuth('login')}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth('signup')}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-5 py-2 rounded-lg font-medium transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          Manage shared living,
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"> effortlessly</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Track expenses, assign chores, and keep your household running smoothly — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowAuth('signup')}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center space-x-2 shadow-xl shadow-blue-500/30"
          >
            <span>Start Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={handleDemoLogin}
            className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center space-x-2"
          >
            <span>Try Demo</span>
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-4">Demo resets every 24 hours • No credit card needed</p>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: DollarSign, title: 'Smart Expense Splitting', desc: 'Split bills equally, by percentage, or custom amounts. Supports UPI deep links for instant payments.', color: 'blue' },
            { icon: CheckSquare, title: 'Recurring Chores', desc: 'Auto-rotate chores among roommates on daily, weekly, or monthly schedules. Never miss a task.', color: 'cyan' },
            { icon: TrendingUp, title: 'Real-time Balances', desc: 'See who owes what at a glance. Track settlements, view spending analytics, and stay on top of finances.', color: 'blue' },
          ].map((feature, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300 group">
              <div className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-600 to-${feature.color}-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Expenses Tracked', value: '10K+' },
              { label: 'Active Users', value: '500+' },
              { label: 'Chores Completed', value: '5K+' },
              { label: 'Happy Houses', value: '200+' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-gray-900 bg-opacity-60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <Home className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">Cohabit</span>
              <span className="text-gray-600">|</span>
              <span className="text-sm">Manage shared living, effortlessly</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
