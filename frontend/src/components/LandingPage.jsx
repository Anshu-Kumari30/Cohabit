import React from 'react';
import { Home, Users, DollarSign, CheckSquare, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#DDDDDD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Home className="h-7 w-7 text-coral-500" />
              <span className="text-xl font-bold text-[#222222]">Cohabit</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAuth('login')}
                className="text-[#717171] hover:text-[#222222] font-medium transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth('signup')}
                className="bg-coral-500 hover:bg-coral-600 text-white px-5 py-2.5 rounded-pill font-semibold transition-all shadow-air-sm hover:shadow-air"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-50 mb-6">
            <Home className="h-8 w-8 text-coral-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#222222] leading-tight mb-6">
            Living together,{' '}
            <span className="text-coral-500">made simple</span>
          </h1>
          <p className="text-lg md:text-xl text-[#717171] mb-10 max-w-xl mx-auto leading-relaxed">
            Track expenses, assign chores, manage shared shopping, and stay connected — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAuth('signup')}
              className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-4 rounded-pill font-semibold text-lg transition-all shadow-air-sm hover:shadow-air-lg flex items-center justify-center gap-2"
            >
              Start Free <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={handleDemoLogin}
              className="bg-white hover:bg-gray-50 text-[#222222] px-8 py-4 rounded-pill font-semibold text-lg transition-all border border-[#DDDDDD] shadow-air-sm hover:shadow-air"
            >
              Try Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-[#DDDDDD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: 'Shared Expenses',
                desc: 'Split bills effortlessly. Equal, percentage, or custom splits — your choice.',
              },
              {
                icon: CheckSquare,
                title: 'Rotating Chores',
                desc: 'Assign chores that rotate automatically. Never argue about who does what.',
              },
              {
                icon: Users,
                title: 'Roommate Hub',
                desc: 'Shopping lists, balances, and settlements all in one dashboard.',
              },
            ].map((feature, i) => (
              <div key={i} className="card-air p-8 text-center">
                <div className="badge-air mx-auto mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#222222] mb-2">{feature.title}</h3>
                <p className="text-[#717171] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-[#717171] text-sm">
            © 2026 Cohabit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
