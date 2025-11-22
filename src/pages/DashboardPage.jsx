// src/pages/DashboardPage.jsx
import { useAuth } from '../AuthContext';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import '../css/DashboardPage.css';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ skus: 0, warehouses: 0, inventoryRows: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        setStatsLoading(true);
        const token = localStorage.getItem('auth:token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        // Use the lightweight /api/stats endpoint
        const res = await fetch(`${API_BASE_URL}/api/stats`, { headers });
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();
        if (!mounted) return;
        setStats({ skus: data.skus || 0, warehouses: data.warehouses || 0, inventoryRows: data.inventoryRows || 0, totalAvailable: data.totalAvailable || 0 });
      } catch (err) {
        // silently fail; stats are non-critical
        console.error('Failed to fetch dashboard stats', err);
      }
      finally {
        if (mounted) setStatsLoading(false);
      }
    }

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-dot" />
            <div className="logo-text-group">
              <span className="logo-title">Inventory Hub</span>
              <span className="logo-subtitle">Control Center</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/dashboard/sku"
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">SKU Management</span>
          </NavLink>

          <NavLink
            to="/dashboard/inventory"
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">📚</span>
            <span className="nav-label">Inventory</span>
          </NavLink>

          <NavLink
            to="/dashboard/transactions"
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">💸</span>
            <span className="nav-label">Transactions</span>
          </NavLink>

          <NavLink
            to="/dashboard/purchase"
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">📝</span>
            <span className="nav-label">Purchase Orders</span>
          </NavLink>

          <NavLink
            to="/dashboard/analytics"
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">📈</span>
            <span className="nav-label">Analytics</span>
          </NavLink>

          <NavLink
            to="/dashboard/warehouse"
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">🏬</span>
            <span className="nav-label">Warehouse</span>
          </NavLink>

          <div className="nav-section-label">System</div>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="logout-icon">⏏</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="content-area">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back 👋</h1>
            <p className="dashboard-subtitle">
              Here’s what’s happening with your inventory today.
            </p>
            <div className="dashboard-stats" aria-hidden="false">
              <div className="stat-pill" aria-label={`${stats.skus} SKUs`}>📦 <strong>{stats.skus}</strong> SKUs</div>
              <div className="stat-pill" aria-label={`${stats.warehouses} Warehouses`}>🏬 <strong>{stats.warehouses}</strong> W/H</div>
              {statsLoading ? (
                <div className="stat-pill skeleton" aria-hidden="true">
                  <strong className="skeleton-rect" style={{ width: 48 }} />
                  <span className="skeleton-rect" style={{ width: 66, marginLeft: 8 }} />
                </div>
              ) : (
                <div className="stat-pill" aria-label={`${stats.totalAvailable} total available`}>
                  📚 <strong>{stats.totalAvailable}</strong> Available
                </div>
              )}
            </div>
          </div>

          <div className="header-actions">
            <button className="header-chip" aria-label="Demo mode">
              <span className="status-dot" aria-hidden="true" />
              Demo
            </button>
            <button className="header-avatar" aria-label="Open user menu">
              <span className="avatar-circle" aria-hidden="true">V</span>
              <span className="avatar-name">Vidhaan</span>
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-content-surface">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
