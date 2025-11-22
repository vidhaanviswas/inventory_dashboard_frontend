import '../css/TransactionsPage.css';

export default function TransactionsPage() {
  const rows = [
    { id: 'TXN-1001', type: 'Sale',       sku: 'SKU-001', qty: -2,  source: 'Amazon',     date: '2025-11-20' },
    { id: 'TXN-1002', type: 'Purchase',   sku: 'SKU-002', qty: +50, source: 'Supplier A', date: '2025-11-19' },
    { id: 'TXN-1003', type: 'Adjustment', sku: 'SKU-003', qty: -1,  source: 'Audit',      date: '2025-11-18' },
  ];

  const totalTxns = rows.length;
  const inbound = rows
    .filter((r) => r.qty > 0)
    .reduce((sum, r) => sum + r.qty, 0);
  const outbound = rows
    .filter((r) => r.qty < 0)
    .reduce((sum, r) => sum + r.qty, 0);

  function getTypeClass(type) {
    if (type === 'Sale') return 'txn-badge txn-sale';
    if (type === 'Purchase') return 'txn-badge txn-purchase';
    return 'txn-badge txn-adjustment';
  }

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="transactions-header">
        <div>
          <h2 className="transactions-title">Transactions</h2>
          <p className="transactions-subtitle">
            Stream of all stock movements across channels.
          </p>
        </div>

        <button className="transactions-export-btn">
          ⬇ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="transactions-filters">
        <select className="transactions-select">
          <option>All types</option>
          <option>Sale</option>
          <option>Purchase</option>
          <option>Adjustment</option>
        </select>
        <input
          className="transactions-input"
          placeholder="Filter by SKU or Txn ID"
        />
      </div>

      {/* Meta stats */}
      <div className="transactions-meta">
        <span className="transactions-pill">{totalTxns} Transactions</span>
        <span className="transactions-pill subtle">
          Inbound Qty: {inbound}
        </span>
        <span className="transactions-pill subtle">
          Outbound Qty: {outbound}
        </span>
      </div>

      {/* Table Card */}
      <div className="transactions-card">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Type</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Source</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const qtyClass = row.qty >= 0 ? 'txn-qty-pos' : 'txn-qty-neg';

              return (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <span className={getTypeClass(row.type)}>{row.type}</span>
                  </td>
                  <td>{row.sku}</td>
                  <td className={qtyClass}>{row.qty}</td>
                  <td>{row.source}</td>
                  <td>{row.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
