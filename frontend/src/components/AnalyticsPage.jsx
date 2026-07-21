import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { expensesAPI } from '../services/api';
import SkeletonCard from './SkeletonCard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const COLORS = ['#FF385C', '#FF6B8A', '#FFB3C1', '#FFE0E6', '#F7F7F7', '#222222', '#DDDDDD'];

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
        <div className="h-8 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
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
      borderColor: '#FF385C',
      backgroundColor: 'rgba(255, 56, 92, 0.1)',
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
      backgroundColor: ['#FF385C', '#FF6B8A', '#FFB3C1', '#222222', '#DDDDDD'].slice(0, (analytics?.perPerson || []).length),
      borderRadius: 8,
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#222222] flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-coral-500" />
          Analytics
        </h2>
        <div className="flex items-center space-x-1 bg-[#F7F7F7] rounded-pill p-1">
          {[
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '3m' },
            { label: 'All Time', value: 'all' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-1.5 rounded-pill text-sm font-semibold transition-all ${
                range === opt.value
                  ? 'bg-coral-500 text-white shadow-air-sm'
                  : 'text-[#717171] hover:text-[#222222]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Spend Trend */}
        <div className="bg-white rounded-air shadow-air p-6">
          <h3 className="text-lg font-bold text-[#222222] mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-coral-500" />
            Monthly Spend Trend
          </h3>
          {analytics?.monthlyTrend?.length > 0 ? (
            <Line data={monthlyData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#717171' }, grid: { color: '#DDDDDD' } },
                y: { ticks: { color: '#717171' }, grid: { color: '#DDDDDD' } }
              }
            }} />
          ) : (
            <p className="text-[#717171] text-center py-8">No data yet</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-air shadow-air p-6">
          <h3 className="text-lg font-bold text-[#222222] mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-coral-500" />
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
                      labels: { color: '#717171', padding: 12 }
                    }
                  }
                }} />
              </div>
            </div>
          ) : (
            <p className="text-[#717171] text-center py-8">No data yet</p>
          )}
        </div>

        {/* Per-Person Spending */}
        <div className="bg-white rounded-air shadow-air p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-[#222222] mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-coral-500" />
            Per-Person Spending
          </h3>
          {analytics?.perPerson?.length > 0 ? (
            <Bar data={perPersonData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: { ticks: { color: '#717171' }, grid: { color: '#DDDDDD' } },
                y: { ticks: { color: '#717171' }, grid: { color: '#DDDDDD' } }
              }
            }} />
          ) : (
            <p className="text-[#717171] text-center py-8">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
