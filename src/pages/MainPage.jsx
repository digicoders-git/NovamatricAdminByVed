import React, { useEffect, useState } from 'react';
import './CSS/MainPage.css';
import Dashboard from './Dashboard';

const API_URL = import.meta.env.VITE_API_URL;

// StatsCard Component
const StatsCard = ({ title, value, icon, trend }) => (
  <div className="main-page-stat-card">
    <div className="main-page-stat-header">
      <span className="main-page-stat-icon">{icon}</span>
      {trend !== undefined && (
        <span
          className={`main-page-stat-trend ${
            trend > 0 ? 'positive' : 'negative'
          }`}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="main-page-stat-title">{title}</h3>
    <p className="main-page-stat-value">{Number(value || 0).toLocaleString()}</p>
  </div>
);

// Proportional BarChart Component
const BarChartComponent = ({ stats }) => {
  const data = [
    { label: 'Completed', value: stats.completedCount || 0, color: '#10b981' },
    { label: 'Terminated', value: stats.terminatedCount || 0, color: '#ef4444' },
    { label: 'Quota Full', value: stats.quotaFullCount || 0, color: '#f59e0b' }
  ];

  const total = data.reduce((acc, item) => acc + item.value, 0) || 1;

  return (
    <div className="main-page-chart-container">
      {data.map((item, idx) => (
        <div key={idx} className="main-page-chart-bar-wrapper">
          <div className="main-page-chart-label">{item.label}</div>

          <div className="main-page-chart-bar-bg">
            <div
              className="main-page-chart-bar-fill"
              style={{
                width: `${(item.value / total) * 100}%`,
                backgroundColor: item.color
              }}
            >
              <span className="main-page-chart-bar-value">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Dashboard Component
const MainPage = () => {
  const [filter, setFilter] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalClicks: 0,
    totalSubmissions: 0,
    completedCount: 0,
    terminatedCount: 0,
    quotaFullCount: 0,
    today: {
      todayClicks: 0,
      todayCompleted: 0,
      todayTerminated: 0,
      todayQuotaFull: 0
    }
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/dashboard/dashboard?filter=${filter}`
      );
      const data = await res.json();
      if (data?.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [filter]);

  return (
    <Dashboard>
      <div className="main-page-wrapper">
        <div className="main-page-container">
          {/* Header with Controls */}
          <div className="main-page-header">
            <h1 className="main-page-title">📊 Dashboard Analytics</h1>
            <div className="main-page-controls">
              <select
                className="main-page-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="weekly">📅 Weekly</option>
                <option value="monthly">📅 Monthly</option>
                <option value="yearly">📅 Yearly</option>
              </select>

              <button
                className="main-page-refresh-btn"
                onClick={fetchStats}
                disabled={loading}
              >
                {loading ? '⟳ Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>

          {/* Today Overview Section */}
          <h2 className="main-page-section-title">Today's Overview</h2>
          <div className="main-page-stats-grid">
            <StatsCard
              title="Today Clicks"
              value={stats.today.todayClicks}
              icon="🖱️"
            />
            <StatsCard
              title="Today Completed"
              value={stats.today.todayCompleted}
              icon="✔️"
            />
            <StatsCard
              title="Today Terminated"
              value={stats.today.todayTerminated}
              icon="❌"
            />
            <StatsCard
              title="Today Quota Full"
              value={stats.today.todayQuotaFull}
              icon="🔒"
            />
          </div>

          {/* Overall Stats Section */}
          <h2 className="main-page-section-title">Overall Statistics</h2>
          <div className="main-page-stats-grid">
            <StatsCard title="Total Surveys" value={stats.totalSurveys} icon="📋" />
            <StatsCard title="Total Clicks" value={stats.totalClicks} icon="👆" />
            <StatsCard
              title="Total Submissions"
              value={stats.totalSubmissions}
              icon="✅"
            />
          </div>

          {/* Overall Status Totals */}
          <h2 className="main-page-section-title">Overall Status Totals</h2>
          <div className="main-page-stats-grid">
            <StatsCard
              title="Total Completed"
              value={stats.completedCount}
              icon="✔️"
            />
            <StatsCard
              title="Total Terminated"
              value={stats.terminatedCount}
              icon="❌"
            />
            <StatsCard
              title="Total Quota Full"
              value={stats.quotaFullCount}
              icon="🔒"
            />
          </div>

          {/* Status Breakdown Section */}
          <h2 className="main-page-section-title">Status Breakdown</h2>
          <BarChartComponent stats={stats} />
        </div>
      </div>
    </Dashboard>
  );
};

export default MainPage;
