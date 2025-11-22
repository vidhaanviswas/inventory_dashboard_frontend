// src/pages/SkuManagementPage.jsx
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import '../css/SkuManagementPage.css';

export default function SkuManagementPage() {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentId, setCurrentId] = useState(null);

  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Apparel');
  const [formStatus, setFormStatus] = useState('Active');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [countPulse, setCountPulse] = useState(false);

  async function fetchSkus() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.append('q', search.trim());
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const token = localStorage.getItem('auth:token');

      const res = await fetch(
        `${API_BASE_URL}/api/skus?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load SKUs');
      }

      const data = await res.json();
      setSkus(data);
    } catch (err) {
      console.error('SKU fetch error:', err);
      setError(err.message || 'Error loading SKUs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSkus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // pulse animation when SKU count changes
    setCountPulse(true);
    const t = setTimeout(() => setCountPulse(false), 400);
    return () => clearTimeout(t);
  }, [skus.length]);

  function handleApplyFilters(e) {
    e.preventDefault();
    fetchSkus();
  }

  // ---- Modal helpers ----
  function openCreateModal() {
    setModalMode('create');
    setCurrentId(null);
    setFormSku('');
    setFormName('');
    setFormCategory('Apparel');
    setFormStatus('Active');
    setModalError('');
    setModalOpen(true);
  }

  function openEditModal(sku) {
    setModalMode('edit');
    setCurrentId(sku._id);
    setFormSku(sku.sku);
    setFormName(sku.name);
    setFormCategory(sku.category);
    setFormStatus(sku.status || 'Active');
    setModalError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalLoading(false);
    setModalError('');
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    setModalError('');

    // if (!formSku && modalMode === 'create') {
    //   setModalError('SKU code is required.');
    //   return;
    // }
    if (!formName || !formCategory || !formStatus) {
      setModalError('Please fill all fields.');
      return;
    }

    setModalLoading(true);

    try {
      const token = localStorage.getItem('auth:token');
      const commonHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (modalMode === 'create') {
        const res = await fetch(`${API_BASE_URL}/api/skus`, {
          method: 'POST',
          headers: commonHeaders,
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            status: formStatus,
          }),
        });

        const text = await res.text();
        let data = {};
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Create SKU non-JSON response:', text);
        }

        if (!res.ok) {
          throw new Error(data.message || `Failed to create SKU (status ${res.status})`);
        }
      } else {
        // ✏️ Edit
        const res = await fetch(`${API_BASE_URL}/api/skus/${currentId}`, {
          method: 'PUT',
          headers: commonHeaders,
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            status: formStatus,
          }),
        });

        const text = await res.text();
        let data = {};
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Update SKU non-JSON response:', text);
        }

        if (!res.ok) {
          throw new Error(data.message || `Failed to update SKU (status ${res.status})`);
        }
      }

      await fetchSkus();
      closeModal();
    } catch (err) {
      console.error('SKU save error:', err);
      setModalError(err.message || 'Error saving SKU');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="sku-page">
      <div className="sku-header">
        <div>
          <h2 className="sku-title">SKU Management</h2>
          <p className="sku-subtitle">
            Central place to manage all your products and variants.
          </p>
        </div>
        <div className="sku-header-actions">
          {/* <button className="sku-btn-outline">Import</button> */}
          <button className="sku-btn-primary" onClick={openCreateModal}>
            + Add SKU
          </button>
        </div>
      </div>

      {/* Filters */}
      <form className="sku-filters" onSubmit={handleApplyFilters}>
        <input
          className="sku-input"
          placeholder="Search by SKU or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="sku-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All categories</option>
          <option value="Apparel">Apparel</option>
          <option value="Footwear">Footwear</option>
        </select>
        <select
          className="sku-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
        </select>
        <button type="submit" className="sku-btn-outline">
          Apply
        </button>
      </form>

      <div className="sku-meta-row">
        <span className={`sku-pill ${countPulse ? 'count-anim pulse' : ''}`}>{skus.length} SKUs</span>
        <span className="sku-pill subtle">Data from MongoDB</span>
      </div>

      <div className="sku-table-card">
        {loading ? (
          <p className="sku-loading">Loading SKUs…</p>
        ) : error ? (
          <p className="sku-error">{error}</p>
        ) : skus.length === 0 ? (
          <p className="sku-empty">No SKUs found. Try adjusting filters.</p>
        ) : (
          <table className="sku-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th className="sku-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((row) => (
                <tr key={row._id || row.sku}>
                  <td>{row.sku}</td>
                  <td>{row.name}</td>
                  <td>{row.category}</td>
                  <td>
                    <span
                      className={
                        row.status === 'Active'
                          ? 'sku-badge sku-badge-active'
                          : 'sku-badge sku-badge-draft'
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="sku-actions-cell">
                    <div className="sku-action-group">
                      <button
                        className="sku-btn-outline sku-btn-small icon-btn"
                        type="button"
                        aria-label={`Edit ${row.name}`}
                        title="Edit"
                        onClick={() => openEditModal(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
                          <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        className="sku-btn-danger sku-btn-small icon-btn"
                        type="button"
                        aria-label={`Delete ${row.name}`}
                        title="Delete"
                        onClick={async () => {
                          const ok = window.confirm(`Delete SKU "${row.name}" (${row.sku})? This cannot be undone.`);
                          if (!ok) return;
                          try {
                            const token = localStorage.getItem('auth:token');
                            const res = await fetch(`${API_BASE_URL}/api/skus/${row._id}`, {
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
                            await fetchSkus();
                          } catch (err) {
                            console.error('Delete SKU error', err);
                            alert(err.message || 'Failed to delete SKU');
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z" fill="currentColor" />
                          <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Create / Edit */}
      {modalOpen && (
        <div
          className="sku-modal-backdrop"
          onClick={closeModal}
        >
          <div
            className="sku-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sku-modal-header">
              <h3>{modalMode === 'create' ? 'Add SKU' : 'Edit SKU'}</h3>
              <button
                type="button"
                className="sku-modal-close"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <form className="sku-modal-form" onSubmit={handleModalSubmit}>
              {modalMode === 'create' && (
                <label className="sku-modal-field">
                  <span>SKU Code (auto-generated)</span>
                  <input
                    type="text"
                    disabled
                    placeholder="Will be assigned automatically"
                  />
                </label>
              )}

              {modalMode === 'edit' && (
                <label className="sku-modal-field">
                  <span>SKU Code</span>
                  <input type="text" value={formSku} disabled />
                </label>
              )}

              <label className="sku-modal-field">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="Product name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </label>

              <label className="sku-modal-field">
                <span>Category</span>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </label>

              <label className="sku-modal-field">
                <span>Status</span>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </label>

              {modalError && (
                <p className="sku-modal-error">{modalError}</p>
              )}

              <div className="sku-modal-actions">
                <button
                  type="button"
                  className="sku-btn-outline"
                  onClick={closeModal}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sku-btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? modalMode === 'create'
                      ? 'Creating…'
                      : 'Saving…'
                    : modalMode === 'create'
                      ? 'Create SKU'
                      : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
