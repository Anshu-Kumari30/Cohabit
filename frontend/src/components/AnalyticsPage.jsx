import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { expensesAPI } from '../services/api';
import SkeletonCard from './SkeletonCard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', '#ec4899'];

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expensesAPI.getAnalytics(range);
      if (data.success) setAnalytics(data.analytics);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-800 rounded w-48 animate-pulse"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const monthlyData = {
    labels: (analytics?.monthlyTrend || []).map(m => m.month),
    datasets: [{
      label: 'Monthly Spend',
      data: (analytics?.monthlyTrend || []).map(m => m.total),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const categoryData = {
    labels: (analytics?.categoryBreakdown || []).map(c => c.category),
    datasets: [{
      data: (analytics?.categoryBreakdown || []).map(c => c.total),
      backgroundColor: COLORS.slice(0, (analytics?.categoryBreakdown || []).length),
      borderWidth: 0,
    }]
  };

  const perPersonData = {
    labels: (analytics?.perPerson || []).map(p => `${p.firstName} ${p.lastName}`),
    datasets: [{
      label: 'Total Spent',
      data: (analytics?.perPerson || []).map(p => p.totalSpent),
      backgroundColor: COLORS.slice(0, (analytics?.perPerson || []).length),
      borderRadius: 8,
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
          Analytics
        </h2>
        <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
          {[
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '3m' },
            { label: 'All Time', value: 'all' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                range === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Spend Trend */}
        <div className="bg-gray-900 border border-blue-500 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
            Monthly Spend Trend
          </h3>
          {analytics?.monthlyTrend?.length > 0 ? (
            <Line data={monthlyData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } }
              }
            }} />
          ) : (
            <p className="text-gray-500 text-center py-8">No data yet</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-900 border border-cyan-500 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-cyan-400" />
            Category Breakdown
          </h3>
          {analytics?.categoryBreakdown?.length > 0 ? (
            <div className="flex items-center justify-center">
              <div className="w-64">
                <Doughnut data={categoryData} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#9ca3af', padding: 12 }
                    }
                  }
                }} />
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data yet</p>
          )}
        </div>

        {/* Per-Person Spending */}
        <div className="bg-gray-900 border border-blue-500 rounded-xl p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
            Per-Person Spending
          </h3>
          {analytics?.perPerson?.length > 0 ? (
            <Bar data={perPersonData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } }
              }
            }} />
          ) : (
            <p className="text-gray-500 text-center py-8">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
