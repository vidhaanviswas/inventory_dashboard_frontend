import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import '../css/AnalyticsPage.css';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalSkus: 0,
    totalAvailable: 0,
    ownWarehouses: 0,
    ecommerceWarehouses: 0,
    thirdPartyWarehouses: 0,
    activeSkus: 0,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
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
        const data = await res.json();
        if (!mounted) return;

        setStats({
          totalSkus: data.skus || 0,
          totalAvailable: data.totalAvailable || 0,
          ownWarehouses: data.ownWarehouses || 0,
          ecommerceWarehouses: data.ecommerceWarehouses || 0,
          thirdPartyWarehouses: data.thirdPartyWarehouses || 0,
          activeSkus: data.activeSkus || 0,
        });
      } catch (err) {
        console.error('Overview fetch error', err);
        if (mounted) setError('Failed to load overview');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    // also fetch low-stock alerts
    (async function fetchAlerts() {
      try {
        const token = localStorage.getItem('auth:token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const res = await fetch(`${API_BASE_URL}/api/alerts?type=low-stock&limit=5&threshold=10`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setLowAlerts(data || []);
      } catch (err) {
        console.error('Failed fetching alerts', err);
      }
    })();
    // fetch stockout count (threshold = 0)
    (async function fetchStockouts() {
      try {
        const token = localStorage.getItem('auth:token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const res = await fetch(`${API_BASE_URL}/api/alerts?type=low-stock&limit=1000&threshold=0`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setStockoutCount((data || []).length);
      } catch (err) {
        console.error('Failed fetching stockouts', err);
      }
    })();
    // demand-trend fetch removed (disabled)
    return () => {
      mounted = false;
    };
  }, []);

  const [lowAlerts, setLowAlerts] = useState([]);

  // trend data removed

  const fmt = (v) => new Intl.NumberFormat().format(v || 0);

  const cards = [
    { title: 'Total SKUs', value: fmt(stats.totalSkus) },
    { title: 'Total Available', value: `${fmt(stats.totalAvailable)} units` },
    { title: 'Own Warehouses', value: fmt(stats.ownWarehouses) },
    { title: 'Ecommerce Warehouses', value: fmt(stats.ecommerceWarehouses) },
    { title: 'Third‑party Warehouses', value: fmt(stats.thirdPartyWarehouses) },
    { title: 'Active SKUs', value: fmt(stats.activeSkus) },
  ];

  const [stockoutCount, setStockoutCount] = useState(0);



  return (
    <section id="overview" className="overview-page">
      {error && <div role="alert" className="page-error">{error}</div>}

      <div className="stats-grid" aria-live="polite">
        {loading
          ? cards.map((c, i) => (
            <div key={i} className="stat-card skeleton" aria-hidden="true">
              <div className="stat-title skeleton-rect" style={{ width: '55%' }} />
              <div className="stat-value skeleton-rect" style={{ width: '40%', height: 20, marginTop: 8 }} />
            </div>
          ))
          : cards.map((item, index) => (
            <div key={index} className="stat-card" tabIndex={0} role="article" aria-label={`${item.title}: ${item.value}`}>
              <h3 className="stat-title">{item.title}</h3>
              <p className="stat-value">{item.value}</p>
            </div>
          ))}
      </div>

      {/* Low Stock Alerts */}
      <div className="low-alerts">
        <div className="low-alerts-header">
          <h3>Low Stock Alerts</h3>
          <small>SKUs at or below threshold</small>
        </div>
        {lowAlerts.length === 0 ? (
          <div className="low-alerts-empty">No low-stock SKUs.</div>
        ) : (
          <ul className="alert-list">
            {lowAlerts.map((a) => (
              <li key={a.sku} className="alert-item">
                <div className="alert-meta">
                  <div className="alert-sku">{a.sku}</div>
                  <div className="alert-name">{a.name || '—'}</div>
                </div>
                <div className="alert-right">
                  <div className="alert-count">{new Intl.NumberFormat().format(a.totalAvailable)}</div>
                  <div className="alert-actions">
                    <button className="action-btn secondary" onClick={() => console.log('Create PO for', a.sku)}>Create PO</button>
                    <button className="action-btn" onClick={() => console.log('View SKU', a.sku)}>View</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>


    </section>
  );
}
