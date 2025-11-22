import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import '../css/AnalyticsPage.css';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async function load() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('auth:token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(`${API_BASE_URL}/api/stats`, { headers });
        if (!res.ok) throw new Error('Failed to load stats');
        const d = await res.json();
        if (!mounted) return;
        setStats(d || {});
      } catch (err) {
        console.error('Analytics load error', err);
        if (mounted) setError('Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fmt = (v) => new Intl.NumberFormat().format(v || 0);

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Analytics</h2>
          <p className="analytics-subtitle">High-level performance indicators across your inventory and orders.</p>
        </div>
        <div className="analytics-header-right">Updated: live</div>
      </div>

      {error && <div role="alert" className="page-error">{error}</div>}

      {/* KPI Cards (live where possible) */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-label">Total SKUs</div>
          <div className="analytics-card-value">{loading ? '…' : fmt(stats?.skus)}</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-label">Total Available</div>
          <div className="analytics-card-value">{loading ? '…' : `${fmt(stats?.totalAvailable)} units`}</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-label">Active SKUs</div>
          <div className="analytics-card-value">{loading ? '…' : fmt(stats?.activeSkus)}</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-label">Warehouses</div>
          <div className="analytics-card-value">
            {loading ? '…' : `${fmt(stats?.ownWarehouses || 0)} own • ${fmt(stats?.ecommerceWarehouses || 0)} ecommerce • ${fmt(stats?.thirdPartyWarehouses || 0)} 3PL`}
          </div>
        </div>
      </div>
    </div>
  );
}
