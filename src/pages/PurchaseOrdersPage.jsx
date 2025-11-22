import '../css/PurchaseOrdersPage.css';

export default function PurchaseOrdersPage() {
  const rows = [
    { po: 'PO-9001', supplier: 'Supplier A', status: 'Open',                items: 3, eta: '2025-11-25' },
    { po: 'PO-9002', supplier: 'Supplier B', status: 'Partially Received',  items: 5, eta: '2025-11-23' },
    { po: 'PO-9003', supplier: 'Supplier C', status: 'Closed',              items: 2, eta: '2025-11-15' },
  ];

  const totalPOs = rows.length;
  const openCount = rows.filter((r) => r.status === 'Open').length;

  function getStatusClass(status) {
    if (status === 'Open') return 'po-badge po-open';
    if (status === 'Partially Received') return 'po-badge po-partial';
    return 'po-badge po-closed';
  }

  return (
    <div className="purchase-page">
      {/* Header */}
      <div className="purchase-header">
        <div>
          <h2 className="purchase-title">Purchase Orders</h2>
          <p className="purchase-subtitle">
            Track inbound stock and supplier commitments.
          </p>
        </div>

        <button className="purchase-btn">+ New PO</button>
      </div>

      {/* Filters */}
      <div className="purchase-filters">
        <select className="purchase-select">
          <option>All statuses</option>
          <option>Open</option>
          <option>Partially Received</option>
          <option>Closed</option>
        </select>
        <input
          className="purchase-input"
          placeholder="Search by PO or supplier"
        />
      </div>

      {/* Meta info */}
      <div className="purchase-meta">
        <span className="purchase-pill">{totalPOs} Purchase Orders</span>
        <span className="purchase-pill subtle">Open: {openCount}</span>
      </div>

      {/* Table card */}
      <div className="purchase-card">
        <table className="purchase-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Items</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.po}>
                <td>{row.po}</td>
                <td>{row.supplier}</td>
                <td>
                  <span className={getStatusClass(row.status)}>
                    {row.status}
                  </span>
                </td>
                <td>{row.items}</td>
                <td>{row.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
