// src/pages/InventoryPage.jsx
import { useEffect, useState, useMemo, useRef } from 'react';
import SuggestionsList from '../components/SuggestionsList';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../css/InventoryPage.css';

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skusLoading, setSkusLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();


  const [skuFilter, setSkuFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Add Inventory modal state
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [invModalMode, setInvModalMode] = useState('create'); // 'create' | 'edit'
  const [currentInvId, setCurrentInvId] = useState(null);
  const [newSku, setNewSku] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);

  // For improved SKU search in modal
  const [newSkuQuery, setNewSkuQuery] = useState('');
  const [debouncedNewSkuQuery, setDebouncedNewSkuQuery] = useState('');
  const [skuSuggestionOpen, setSkuSuggestionOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const skuInputRef = useRef(null);
  const [newAvailable, setNewAvailable] = useState('');
  const [newReserved, setNewReserved] = useState('');
  const [invModalError, setInvModalError] = useState('');
  const [invModalLoading, setInvModalLoading] = useState(false);

  // Fetch Inventory
  async function fetchInventory(override = {}) {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      const skuParam = override.sku ?? skuFilter;
      const locParam = override.location ?? locationFilter;

      if (skuParam?.trim()) params.append('sku', skuParam.trim());
      if (locParam?.trim()) params.append('location', locParam.trim());

      const token = localStorage.getItem('auth:token');

      const res = await fetch(
        `${API_BASE_URL}/api/inventory?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load inventory');
      }

      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error('Inventory fetch error:', err);
      setError(err.message || 'Error loading inventory');
    } finally {
      setLoading(false);
    }
  }


  // Fetch SKUs (for item_name + SKU dropdown)
  async function fetchSkus(q) {
    // server-side SKU search: pass optional query
    setSkusLoading(true);
    try {
      const token = localStorage.getItem('auth:token');
      const qs = q ? `?q=${encodeURIComponent(q)}` : '';
      const res = await fetch(`${API_BASE_URL}/api/skus${qs}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load SKUs');
      }

      const data = await res.json();
      setSkus(data);
    } catch (err) {
      console.error('SKU list fetch error:', err);
      // don't block inventory if SKUs fail
    } finally {
      setSkusLoading(false);
    }
  }

  async function fetchWarehouses() {
    setWarehousesLoading(true);
    try {
      const token = localStorage.getItem('auth:token');
      const res = await fetch(`${API_BASE_URL}/api/warehouses`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load warehouses');
      }

      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      console.error('Warehouses fetch error:', err);
    } finally {
      setWarehousesLoading(false);
    }
  }

  useEffect(() => {
    // fetch initial skus list (empty query) and warehouses
    fetchSkus('');
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce newSkuQuery so filtering suggestions doesn't run too often while typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedNewSkuQuery(newSkuQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [newSkuQuery]);

  // Fetch SKUs from server whenever the debounced query changes (server-side search)
  useEffect(() => {
    fetchSkus(debouncedNewSkuQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNewSkuQuery]);

  const filteredSkusForModal = useMemo(() => {
    const q = debouncedNewSkuQuery.toLowerCase();
    if (!q) return skus.slice(0, 40);
    return skus.filter(
      (s) => s.sku.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q)
    );
  }, [skus, debouncedNewSkuQuery]);

  const warehouseOptions = useMemo(() => warehouses || [], [warehouses]);

  // --- debounce main filters for auto-refresh ---
  const [debouncedSkuFilter, setDebouncedSkuFilter] = useState(skuFilter);
  const [debouncedLocationFilter, setDebouncedLocationFilter] = useState(locationFilter);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSkuFilter(skuFilter.trim()), 400);
    return () => clearTimeout(t);
  }, [skuFilter]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocationFilter(locationFilter.trim()), 400);
    return () => clearTimeout(t);
  }, [locationFilter]);

  useEffect(() => {
    // auto-refresh when debounced filters change
    fetchInventory({ sku: debouncedSkuFilter, location: debouncedLocationFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSkuFilter, debouncedLocationFilter]);

  // Selected SKU display name
  const selectedSkuName = useMemo(() => {
    const s = skus.find((x) => x.sku === (newSku || newSkuQuery));
    return s ? s.name : null;
  }, [skus, newSku, newSkuQuery]);

  function selectSku(sku) {
    setNewSku(sku.sku);
    setNewSkuQuery(sku.sku);
    setSkuSuggestionOpen(false);
    setHighlightIndex(-1);
  }

  function highlightMatch(text, q) {
    if (!q) return text;
    const lower = text.toLowerCase();
    const ql = q.toLowerCase();
    const parts = [];
    let idx = 0;
    while (true) {
      const i = lower.indexOf(ql, idx);
      if (i === -1) {
        parts.push({ text: text.slice(idx), match: false });
        break;
      }
      if (i > idx) parts.push({ text: text.slice(idx, i), match: false });
      parts.push({ text: text.slice(i, i + ql.length), match: true });
      idx = i + ql.length;
    }
    return parts.map((p, i) =>
      p.match ? (
        <span key={i} className="match-highlight">
          {p.text}
        </span>
      ) : (
        <span key={i}>{p.text}</span>
      )
    );
  }

  // --- Warehouse suggestions (custom dropdown) ---
  const [whSuggestionOpen, setWhSuggestionOpen] = useState(false);
  const [whHighlightIndex, setWhHighlightIndex] = useState(-1);
  const whInputRef = useRef(null);

  function selectWarehouse(code) {
    // accepts either warehouse object or code string
    const value = code && typeof code === 'object' ? code.code : code;
    setNewLocation(value);
    setWhSuggestionOpen(false);
    setWhHighlightIndex(-1);
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const wh = params.get('warehouse');

    if (wh) {
      setLocationFilter(wh);
      fetchInventory({ location: wh });
    } else {
      fetchInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);


  function handleApplyFilters(e) {
    e.preventDefault();
    fetchInventory();
  }

  // Map SKU -> name
  const skuNameMap = skus.reduce((acc, sku) => {
    acc[sku.sku] = sku.name;
    return acc;
  }, {});

  // Totals per SKU (sum across all warehouses)
  const totalsBySku = rows.reduce((acc, r) => {
    const key = r.sku;
    const avail = r.available || 0;
    acc[key] = (acc[key] || 0) + avail;
    return acc;
  }, {});

  const totalAvailableAll = rows.reduce(
    (sum, r) => sum + (r.available || 0),
    0
  );
  const distinctSkus = new Set(rows.map((r) => r.sku)).size;

  function getStatusForSku(skuCode) {
    const total = totalsBySku[skuCode] || 0;
    if (total <= 0) return 'out_of_stock';
    if (total < 10) return 'less';
    return 'in_stock';
  }

  function getStatusLabel(code) {
    if (code === 'out_of_stock') return 'Out of stock';
    if (code === 'less') return 'Low stock';
    return 'In stock';
  }

  // ---- Add Inventory Modal helpers ----
  function openInvModal() {
    setInvModalMode('create');
    setCurrentInvId(null);
    setInvModalOpen(true);
    setInvModalError('');
    setNewSku('');
    setNewSkuQuery('');
    setNewLocation('');
    setNewAvailable('');
    setNewReserved('');
  }

  function closeInvModal() {
    setInvModalOpen(false);
    setInvModalLoading(false);
    setInvModalError('');
  }

  function openEditInvModal(row) {
    // populate modal with existing values for editing
    setInvModalMode('edit');
    setCurrentInvId(row._id);
    setNewSku(row.sku || '');
    setNewSkuQuery(row.sku || '');
    setNewLocation(row.location || '');
    setNewAvailable(String(row.available || ''));
    setNewReserved(String(row.reserved || ''));
    setInvModalError('');
    setInvModalOpen(true);
  }

  async function handleDeleteInventory(row) {
    if (!window.confirm(`Delete inventory for ${row.sku} at ${row.location}?`)) return;
    try {
      const token = localStorage.getItem('auth:token');
      const res = await fetch(`${API_BASE_URL}/api/inventory/${row._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to delete (status ${res.status})`);
      }

      await fetchInventory();
    } catch (err) {
      console.error('Delete inventory error:', err);
      alert(err.message || 'Failed to delete inventory');
    }
  }

  async function handleAddInventory(e) {
    e.preventDefault();
    setInvModalError('');

    // Allow user to type SKU in the search box; resolve from query if possible
    let skuToSend = newSku;
    if (!skuToSend && newSkuQuery) {
      // if the query exactly matches a sku code, use it
      const found = skus.find((s) => s.sku === newSkuQuery.trim());
      if (found) skuToSend = found.sku;
    }

    if (!skuToSend || !newLocation) {
      setInvModalError('Please select SKU and enter warehouse name.');
      return;
    }

    const availableNum = Number(newAvailable || 0);
    const reservedNum = Number(newReserved || 0);

    if (Number.isNaN(availableNum) || Number.isNaN(reservedNum)) {
      setInvModalError('Stocks must be numbers.');
      return;
    }

    setInvModalLoading(true);

    try {
      const token = localStorage.getItem('auth:token');
      let res;
      let url = `${API_BASE_URL}/api/inventory`;
      let method = 'POST';

      if (invModalMode === 'edit' && currentInvId) {
        url = `${API_BASE_URL}/api/inventory/${currentInvId}`;
        method = 'PUT';
      }

      res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sku: skuToSend,
          location: newLocation,
          available: availableNum,
          reserved: reservedNum,
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Inventory save non-JSON response:', text);
      }

      if (!res.ok) {
        throw new Error(data.message || `Failed to save inventory (status ${res.status})`);
      }

      // Refresh list and close modal
      await fetchInventory();
      closeInvModal();
    } catch (err) {
      console.error('Add inventory error:', err);
      setInvModalError(err.message || 'Error adding inventory');
    } finally {
      setInvModalLoading(false);
    }
  }

  return (
    <div className="inventory-page">
      {/* Header Section */}
      <div className="inventory-header">
        <div>
          <h2 className="inventory-title">Inventory</h2>
          <p className="inventory-sync">Live stock from all warehouses</p>
        </div>

        <div className="inventory-header-actions">
          <button className="inventory-btn secondary" onClick={openInvModal}>
            + Add Inventory
          </button>
          <button className="inventory-btn" onClick={fetchInventory}>
            Recalculate
          </button>
        </div>
      </div>

      {/* Filters */}
      <form className="inventory-filters" onSubmit={handleApplyFilters}>
        <input
          className="inventory-input"
          placeholder="Filter by SKU (e.g. SKU-001)"
          value={skuFilter}
          onChange={(e) => setSkuFilter(e.target.value)}
        />
        <input
          className="inventory-input"
          placeholder="Filter by warehouse"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <button type="submit" className="inventory-btn secondary">
          Apply
        </button>
      </form>

      {/* Meta info */}
      <div className="inventory-meta">
        <span className="inventory-pill">
          {rows.length} Records (SKU × warehouse)
        </span>
        <span className="inventory-pill subtle">
          Distinct SKUs: {distinctSkus}
        </span>
        <span className="inventory-pill subtle">
          Total Available: {totalAvailableAll}
        </span>
        {skusLoading && (
          <span className="inventory-pill subtle">Loading SKU names…</span>
        )}
      </div>

      {/* Table Card */}
      <div className="inventory-card">
        {loading ? (
          <p className="inventory-loading">Loading inventory…</p>
        ) : error ? (
          <p className="inventory-error">{error}</p>
        ) : rows.length === 0 ? (
          <p className="inventory-empty">
            No inventory found. Try adjusting filters or add data.
          </p>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="sku-cell">SKU ID</th>
                  <th className="name-cell">Item Name</th>
                  <th className="warehouse-cell">Warehouse</th>
                  <th className="numeric-cell">Stock (this warehouse)</th>
                  <th className="total-cell">Total Inventory (all warehouses)</th>
                  <th className="status-cell">Status</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const perWarehouse = row.available || 0;
                  const totalForSku = totalsBySku[row.sku] || 0;
                  const statusCode = getStatusForSku(row.sku);
                  const statusLabel = getStatusLabel(statusCode);

                  return (
                    <tr key={row._id}>
                      <td className="sku-cell" data-label="SKU ID">{row.sku}</td>
                      <td className="name-cell" data-label="Item Name">{skuNameMap[row.sku] || '—'}</td>
                      <td className="warehouse-cell" data-label="Warehouse">{row.location}</td>
                      <td className="numeric-cell inv-pos" data-label="Stock">{perWarehouse}</td>
                      <td className="total-cell" data-label="Total">{totalForSku}</td>
                      <td className="status-cell" data-label="Status">
                        <span className={`inv-status inv-status-${statusCode}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="actions-cell" data-label="Actions">
                        <div className="action-group">
                          <button
                            type="button"
                            className="action-btn secondary"
                            onClick={() => openEditInvModal(row)}
                            title="Edit inventory"
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="action-btn danger"
                            onClick={() => handleDeleteInventory(row)}
                            title="Delete inventory"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Inventory Modal */}
      {invModalOpen && (
        <div
          className="inv-modal-backdrop"
          onClick={closeInvModal}
        >
          <div
            className="inv-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inv-modal-header">
              <h3>{invModalMode === 'edit' ? 'Edit Inventory' : 'Add Inventory'}</h3>
              <button
                type="button"
                className="inv-modal-close"
                onClick={closeInvModal}
              >
                ✕
              </button>
            </div>

            <form className="inv-modal-form" onSubmit={handleAddInventory}>
              <label className="inv-modal-field" style={{ position: 'relative' }}>
                <span>SKU</span>
                <input
                  ref={skuInputRef}
                  placeholder={skusLoading ? 'Loading SKUs…' : 'Type SKU or name…'}
                  value={newSkuQuery}
                  onChange={(e) => {
                    setNewSkuQuery(e.target.value);
                    const exact = skus.find((s) => s.sku === e.target.value.trim());
                    setNewSku(exact ? exact.sku : '');
                    setSkuSuggestionOpen(true);
                  }}
                  onFocus={() => setSkuSuggestionOpen(true)}
                  onBlur={() => setTimeout(() => setSkuSuggestionOpen(false), 150)}
                  onKeyDown={(e) => {
                    if (!skuSuggestionOpen) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightIndex((i) => Math.min(i + 1, filteredSkusForModal.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === 'Enter') {
                      if (highlightIndex >= 0 && filteredSkusForModal[highlightIndex]) {
                        e.preventDefault();
                        selectSku(filteredSkusForModal[highlightIndex]);
                      }
                    } else if (e.key === 'Escape') {
                      setSkuSuggestionOpen(false);
                    }
                  }}
                />

                {selectedSkuName && (
                  <div style={{ marginTop: 6 }} className="selected-sku-name">
                    {selectedSkuName}
                  </div>
                )}

                {skuSuggestionOpen && filteredSkusForModal.length > 0 && (
                  <SuggestionsList
                    items={filteredSkusForModal}
                    maxItems={10}
                    highlightIndex={highlightIndex}
                    onHighlight={setHighlightIndex}
                    onSelect={selectSku}
                    renderItem={(s) => (
                      <>
                        <div className="sku-code">{highlightMatch(s.sku, debouncedNewSkuQuery)}</div>
                        <div className="sku-name">{highlightMatch(s.name || '', debouncedNewSkuQuery)}</div>
                      </>
                    )}
                  />
                )}

                <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  Start typing SKU code or name and pick from suggestions.
                </small>
              </label>

              <label className="inv-modal-field" style={{ position: 'relative' }}>
                <span>Warehouse name</span>
                <input
                  ref={whInputRef}
                  type="text"
                  placeholder={warehousesLoading ? 'Loading…' : 'e.g. WH-01 (Own)'}
                  value={newLocation}
                  onChange={(e) => {
                    setNewLocation(e.target.value);
                    setWhSuggestionOpen(true);
                  }}
                  onFocus={() => setWhSuggestionOpen(true)}
                  onBlur={() => setTimeout(() => setWhSuggestionOpen(false), 150)}
                  onKeyDown={(e) => {
                    if (!whSuggestionOpen) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setWhHighlightIndex((i) => Math.min(i + 1, warehouseOptions.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setWhHighlightIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === 'Enter') {
                      if (whHighlightIndex >= 0 && warehouseOptions[whHighlightIndex]) {
                        e.preventDefault();
                        selectWarehouse(warehouseOptions[whHighlightIndex]);
                      }
                    } else if (e.key === 'Escape') {
                      setWhSuggestionOpen(false);
                    }
                  }}
                />

                {whSuggestionOpen && warehouseOptions.length > 0 && (
                  <SuggestionsList
                    items={warehouseOptions}
                    maxItems={10}
                    highlightIndex={whHighlightIndex}
                    onHighlight={setWhHighlightIndex}
                    onSelect={(w) => selectWarehouse(w)}
                    renderItem={(w) => (
                      <>
                        <div className="sku-code">{w.code}</div>
                        <div className="sku-name">{w.name || w.city || 'Warehouse'}</div>
                      </>
                    )}
                  />
                )}

                <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  Choose existing warehouse code or type a new one.
                </small>
              </label>

              <label className="inv-modal-field">
                <span>Available stock</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={newAvailable}
                  onChange={(e) => setNewAvailable(e.target.value)}
                />
              </label>

              <label className="inv-modal-field">
                <span>Reserved stock</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={newReserved}
                  onChange={(e) => setNewReserved(e.target.value)}
                />
              </label>

              {invModalError && (
                <p className="inv-modal-error">{invModalError}</p>
              )}

              <div className="inv-modal-actions">
                <button
                  type="button"
                  className="inventory-btn secondary"
                  onClick={closeInvModal}
                  disabled={invModalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inventory-btn"
                  disabled={invModalLoading}
                >
                  {invModalLoading
                    ? (invModalMode === 'edit' ? 'Saving…' : 'Adding…')
                    : (invModalMode === 'edit' ? 'Save changes' : 'Add inventory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
