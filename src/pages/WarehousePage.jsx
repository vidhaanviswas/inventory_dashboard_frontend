// src/pages/WarehousePage.jsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../css/WarehousePage.css';

export default function WarehousePage() {
    const [warehouses, setWarehouses] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invLoading, setInvLoading] = useState(true);
    const [error, setError] = useState('');

    // UI: search and sort
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name | code | skuCount | totalStock
    const [sortDir, setSortDir] = useState('asc');

    // Create/Edit modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [currentId, setCurrentId] = useState(null);

    const [whName, setWhName] = useState('');
    const [whCode, setWhCode] = useState('');
    const [whType, setWhType] = useState('Own');
    const [whCity, setWhCity] = useState('');
    const [whActive, setWhActive] = useState(true);
    const [modalError, setModalError] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    // Breakdown modal state
    const [breakdownOpen, setBreakdownOpen] = useState(false);
    const [breakdownWarehouse, setBreakdownWarehouse] = useState(null);
    const [breakdownRows, setBreakdownRows] = useState([]);

    // navigation removed: no direct 'View inventory' action anymore

    // ---- Data fetching ----
    async function fetchWarehouses() {
        setLoading(true);
        setError('');

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
            console.error('Warehouse fetch error:', err);
            setError(err.message || 'Error loading warehouses');
        } finally {
            setLoading(false);
        }
    }

    async function fetchInventory() {
        setInvLoading(true);
        try {
            const token = localStorage.getItem('auth:token');
            const res = await fetch(`${API_BASE_URL}/api/inventory`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to load inventory');
            }

            const data = await res.json();
            setInventory(data);
        } catch (err) {
            console.error('Inventory fetch error (for warehouses):', err);
            // don't block page on this
        } finally {
            setInvLoading(false);
        }
    }

    useEffect(() => {
        fetchWarehouses();
        fetchInventory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Memoized map of warehouse code -> stats to avoid repeated filtering
    const statsMap = useMemo(() => {
        const map = new Map();
        inventory.forEach((r) => {
            const key = r.location;
            if (!key) return;
            const prev = map.get(key) || { skuSet: new Set(), totalStock: 0 };
            if (r.sku) prev.skuSet.add(r.sku);
            prev.totalStock += r.available || 0;
            map.set(key, prev);
        });

        const out = new Map();
        map.forEach((v, k) => {
            out.set(k, {
                skuCount: v.skuSet.size,
                totalStock: v.totalStock,
                skuList: Array.from(v.skuSet),
            });
        });

        return out;
    }, [inventory]);

    // Derived, filtered and sorted warehouses list
    const filteredAndSortedWarehouses = useMemo(() => {
        const q = (searchQuery || '').trim().toLowerCase();
        let list = warehouses.filter((w) => {
            if (!q) return true;
            return (
                (w.name || '').toLowerCase().includes(q) ||
                (w.code || '').toLowerCase().includes(q) ||
                (w.city || '').toLowerCase().includes(q)
            );
        });

        const dir = sortDir === 'asc' ? 1 : -1;
        list.sort((a, b) => {
            if (sortBy === 'name') return dir * ((a.name || '').localeCompare(b.name || ''));
            if (sortBy === 'code') return dir * ((a.code || '').localeCompare(b.code || ''));
            if (sortBy === 'skuCount') {
                const aa = (statsMap.get(a.code)?.skuCount) || 0;
                const bb = (statsMap.get(b.code)?.skuCount) || 0;
                return dir * (aa - bb);
            }
            if (sortBy === 'totalStock') {
                const aa = (statsMap.get(a.code)?.totalStock) || 0;
                const bb = (statsMap.get(b.code)?.totalStock) || 0;
                return dir * (aa - bb);
            }

            return 0;
        });

        return list;
    }, [warehouses, searchQuery, sortBy, sortDir, statsMap]);

    // ---- Derived stats from inventory ----
    function getWarehouseStats(wh) {
        return statsMap.get(wh.code) || { skuCount: 0, totalStock: 0, skuList: [] };
    }

    // ---- Modal helpers (Create/Edit) ----
    const openCreateModal = useCallback(() => {
        setModalMode('create');
        setCurrentId(null);
        setWhName('');
        setWhCode('');
        setWhType('Own');
        setWhCity('');
        setWhActive(true);
        setModalError('');
        setModalOpen(true);
    }, []);

    const openEditModal = useCallback((wh) => {
        setModalMode('edit');
        setCurrentId(wh._id);
        setWhName(wh.name);
        setWhCode(wh.code);
        setWhType(wh.type || 'Own');
        setWhCity(wh.city || '');
        setWhActive(wh.isActive);
        setModalError('');
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setModalLoading(false);
        setModalError('');
    }, []);

    const handleSaveWarehouse = useCallback(async (e) => {
        e.preventDefault();
        setModalError('');

        if (!whName) {
            setModalError('Warehouse name is required.');
            return;
        }

        // For create mode, code may be empty (server will generate). For edit, require code.
        if (modalMode === 'edit' && !whCode) {
            setModalError('Warehouse code is required when editing.');
            return;
        }

        setModalLoading(true);

        try {
            const token = localStorage.getItem('auth:token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };

            let res;
            if (modalMode === 'create') {
                res = await fetch(`${API_BASE_URL}/api/warehouses`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name: whName,
                        code: whCode,
                        type: whType,
                        city: whCity,
                        isActive: whActive,
                    }),
                });
            } else {
                res = await fetch(`${API_BASE_URL}/api/warehouses/${currentId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        name: whName,
                        code: whCode,
                        type: whType,
                        city: whCity,
                        isActive: whActive,
                    }),
                });
            }

            const text = await res.text();
            let data = {};
            try {
                data = JSON.parse(text);
            } catch {
                console.error('Save warehouse non-JSON response:', text);
            }

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    `Failed to ${modalMode === 'create' ? 'create' : 'update'} warehouse (status ${res.status})`
                );
            }

            await fetchWarehouses();
            closeModal();
        } catch (err) {
            console.error('Save warehouse error:', err);
            setModalError(err.message || 'Error saving warehouse');
        } finally {
            setModalLoading(false);
        }
    }, [currentId, modalMode, whName, whCode, whType, whCity, whActive]);

    // ---- Delete warehouse ----
    const handleDeleteWarehouse = useCallback(async (wh) => {
        const ok = window.confirm(
            `Delete warehouse "${wh.name}" (${wh.code})? This cannot be undone.`
        );
        if (!ok) return;

        try {
            const token = localStorage.getItem('auth:token');
            const res = await fetch(`${API_BASE_URL}/api/warehouses/${wh._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const text = await res.text();
            let data = {};
            try {
                data = JSON.parse(text);
            } catch {
                console.error('Delete warehouse non-JSON response:', text);
            }

            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete warehouse');
            }

            await fetchWarehouses();
        } catch (err) {
            console.error('Delete warehouse error:', err);
            alert(err.message || 'Error deleting warehouse');
        }
    }, []);

    // navigation to Inventory removed (View action was removed)

    // ---- Breakdown modal (per warehouse) ----
    const openBreakdownModal = useCallback((wh) => {
        const rowsForWh = inventory.filter((r) => r.location === wh.code);

        // Group per SKU inside this warehouse
        const bySku = new Map();
        rowsForWh.forEach((r) => {
            const key = r.sku;
            const prev = bySku.get(key) || { sku: key, available: 0, reserved: 0 };
            prev.available += r.available || 0;
            prev.reserved += r.reserved || 0;
            bySku.set(key, prev);
        });

        setBreakdownWarehouse(wh);
        setBreakdownRows(Array.from(bySku.values()));
        setBreakdownOpen(true);
    }, [inventory]);

    const closeBreakdownModal = useCallback(() => {
        setBreakdownOpen(false);
        setBreakdownWarehouse(null);
        setBreakdownRows([]);
    }, []);

    return (
        <div className="warehouse-page">
            <div className="warehouse-header">
                <div>
                    <h2 className="warehouse-title">Warehouses</h2>
                    <p className="warehouse-subtitle">
                        Manage storage locations and see how many SKUs live in each.
                    </p>
                </div>

                <button className="warehouse-btn" onClick={openCreateModal}>
                    + Add Warehouse
                </button>
            </div>

            <div className="warehouse-meta">
                <span className="warehouse-pill">
                    {warehouses.length} Warehouses
                </span>
                {invLoading && (
                    <span className="warehouse-pill subtle">
                        Loading inventory stats…
                    </span>
                )}
            </div>

            <div className="warehouse-controls">
                <div className="warehouse-search">
                    <input
                        aria-label="Search warehouses"
                        placeholder="Search name, code, city…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="warehouse-sort">
                    <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Sort</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name">Name</option>
                        <option value="code">Code</option>
                        <option value="skuCount">SKU count</option>
                        <option value="totalStock">Total stock</option>
                    </select>

                    <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                        <option value="asc">Asc</option>
                        <option value="desc">Desc</option>
                    </select>
                </div>

                <div style={{ marginLeft: 'auto' }} className="warehouse-pill subtle">
                    Showing {filteredAndSortedWarehouses.length}/{warehouses.length}
                </div>
            </div>

            <div className="warehouse-card">
                {loading ? (
                    <p className="warehouse-loading">Loading warehouses…</p>
                ) : error ? (
                    <p className="warehouse-error">{error}</p>
                ) : warehouses.length === 0 ? (
                    <p className="warehouse-empty">
                        No warehouses yet. Click “Add Warehouse” to get started.
                    </p>
                ) : (
                    <table className="warehouse-table">
                        <thead>
                            <tr>
                                <th>Warehouse Name</th>
                                <th>Code</th>
                                <th>Type</th>
                                <th>City</th>
                                <th>SKUs in Warehouse</th>
                                <th>Total Stock</th>
                                <th>Status</th>
                                <th className="wh-th-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedWarehouses.map((wh) => {
                                const { skuCount, totalStock } = getWarehouseStats(wh);

                                return (
                                    <tr key={wh._id}>
                                        <td>{wh.name}</td>
                                        <td>{wh.code}</td>
                                        <td>{wh.type}</td>
                                        <td>{wh.city || '—'}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="wh-sku-count-btn"
                                                onClick={() => openBreakdownModal(wh)}
                                            >
                                                {skuCount} SKUs
                                            </button>
                                        </td>
                                        <td>{totalStock}</td>
                                        <td>
                                            <span
                                                className={
                                                    wh.isActive
                                                        ? 'warehouse-status warehouse-status-active'
                                                        : 'warehouse-status warehouse-status-inactive'
                                                }
                                            >
                                                {wh.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="wh-row-actions action-group">
                                                <button
                                                    type="button"
                                                    className="action-btn secondary"
                                                    onClick={() => openEditModal(wh)}
                                                    aria-label={`Edit ${wh.name}`}
                                                    title={`Edit ${wh.name}`}
                                                >
                                                    <span className="action-icon">✎</span>
                                                    {/* <span>Edit</span> */}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="action-btn danger"
                                                    onClick={() => handleDeleteWarehouse(wh)}
                                                    aria-label={`Delete ${wh.name}`}
                                                    title={`Delete ${wh.name}`}
                                                >
                                                    <span className="action-icon">🗑</span>
                                                    {/* <span>Delete</span> */}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Warehouse Modal */}
            {modalOpen && (
                <div className="wh-modal-backdrop" onClick={closeModal}>
                    <div className="wh-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="wh-modal-header">
                            <h3>
                                {modalMode === 'create' ? 'Add Warehouse' : 'Edit Warehouse'}
                            </h3>
                            <button
                                type="button"
                                className="wh-modal-close"
                                onClick={closeModal}
                            >
                                ✕
                            </button>
                        </div>

                        <form className="wh-modal-form" onSubmit={handleSaveWarehouse}>
                            <label className="wh-modal-field">
                                <span>Warehouse name</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Bangalore WH-01"
                                    value={whName}
                                    onChange={(e) => setWhName(e.target.value)}
                                />
                            </label>

                            <label className="wh-modal-field">
                                <span>Warehouse code (used in Inventory)</span>
                                <input
                                    type="text"
                                    placeholder={modalMode === 'create' ? 'Auto-generated (e.g. WH-001)' : 'e.g. WH-01'}
                                    value={whCode}
                                    onChange={(e) => setWhCode(e.target.value)}
                                    disabled={modalMode === 'create'}
                                    title={
                                        modalMode === 'create'
                                            ? 'Code is auto-generated on create and cannot be edited here.'
                                            : 'Warehouse code'
                                    }
                                />
                                <small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                                    {modalMode === 'create'
                                        ? 'Code will be auto-generated on create (disabled here).'
                                        : 'You can edit the code when modifying an existing warehouse.'}
                                </small>
                            </label>

                            <label className="wh-modal-field">
                                <span>Type</span>
                                <select
                                    value={whType}
                                    onChange={(e) => setWhType(e.target.value)}
                                >
                                    <option value="Own">Own</option>
                                    <option value="3PL">3PL</option>
                                    <option value="Marketplace">Marketplace FC</option>
                                    <option value="Store">Store</option>
                                </select>
                            </label>

                            <label className="wh-modal-field">
                                <span>City / Region</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Bangalore"
                                    value={whCity}
                                    onChange={(e) => setWhCity(e.target.value)}
                                />
                            </label>

                            <label className="wh-modal-field wh-inline">
                                <span>Active</span>
                                <div className="toggle" style={{ marginLeft: 6 }}>
                                    <input
                                        id={`wh-active-${currentId ?? 'new'}`}
                                        className="toggle-input"
                                        type="checkbox"
                                        checked={whActive}
                                        onChange={(e) => setWhActive(e.target.checked)}
                                    />
                                    <label
                                        htmlFor={`wh-active-${currentId ?? 'new'}`}
                                        className="toggle-switch"
                                    ></label>
                                    <span className="toggle-label">{whActive ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </label>

                            {modalError && <p className="wh-modal-error">{modalError}</p>}

                            <div className="wh-modal-actions">
                                <button
                                    type="button"
                                    className="warehouse-btn secondary"
                                    onClick={closeModal}
                                    disabled={modalLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="warehouse-btn"
                                    disabled={modalLoading}
                                >
                                    {modalLoading
                                        ? modalMode === 'create'
                                            ? 'Creating…'
                                            : 'Saving…'
                                        : modalMode === 'create'
                                            ? 'Create warehouse'
                                            : 'Save changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Breakdown Modal */}
            {breakdownOpen && breakdownWarehouse && (
                <div className="wh-modal-backdrop" onClick={closeBreakdownModal}>
                    <div className="wh-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="wh-modal-header">
                            <h3>
                                Inventory breakdown – {breakdownWarehouse.name} (
                                {breakdownWarehouse.code})
                            </h3>
                            <button
                                type="button"
                                className="wh-modal-close"
                                onClick={closeBreakdownModal}
                            >
                                ✕
                            </button>
                        </div>

                        {breakdownRows.length === 0 ? (
                            <p className="warehouse-empty">
                                No inventory for this warehouse yet.
                            </p>
                        ) : (
                            <table className="warehouse-table">
                                <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Available</th>
                                        <th>Reserved</th>
                                        <th>Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdownRows.map((r) => {
                                        const net = (r.available || 0) - (r.reserved || 0);
                                        return (
                                            <tr key={r.sku}>
                                                <td>{r.sku}</td>
                                                <td>{r.available}</td>
                                                <td>{r.reserved}</td>
                                                <td className={net >= 0 ? 'inv-pos' : 'inv-neg'}>
                                                    {net}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
