export default function ReportsPage() {
  return (
    <div className="reports">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">1,248</p>
          <p className="stat-sub">+12% vs last week</p>
        </div>

        <div className="stat-card">
          <h3>Active Sessions</h3>
          <p className="stat-value">89</p>
          <p className="stat-sub">Real-time estimate</p>
        </div>

        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <p className="stat-value">4.2%</p>
          <p className="stat-sub">+0.6% vs yesterday</p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Weekly Activity</h2>
        <p style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#9ca3af' }}>
          Dummy bar chart showing imaginary activity levels.
        </p>

        <div className="bar-chart">
          <div className="bar" style={{ height: '40%' }}>
            <span>Mon</span>
          </div>
          <div className="bar" style={{ height: '65%' }}>
            <span>Tue</span>
          </div>
          <div className="bar" style={{ height: '80%' }}>
            <span>Wed</span>
          </div>
          <div className="bar" style={{ height: '55%' }}>
            <span>Thu</span>
          </div>
          <div className="bar" style={{ height: '70%' }}>
            <span>Fri</span>
          </div>
          <div className="bar" style={{ height: '30%' }}>
            <span>Sat</span>
          </div>
          <div className="bar" style={{ height: '20%' }}>
            <span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
