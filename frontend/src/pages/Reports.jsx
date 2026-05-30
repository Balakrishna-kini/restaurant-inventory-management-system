import { useEffect, useState, useMemo } from 'react'
import { getInventoryItems, getLowStockItems, getCategories, getSuppliers, getPurchaseOrders, getAllStockHistory } from '../api/api'
import { FiPackage, FiAlertTriangle, FiXCircle, FiRefreshCw, FiDollarSign, FiGrid, FiUsers, FiShoppingCart, FiCheckCircle, FiBarChart2, FiClock, FiDownload, FiTrendingUp, FiTrendingDown, FiStar, FiEdit2 } from 'react-icons/fi'
import { useToast } from '../context/ToastContext'
import { getCategoryIcon } from '../utils/categoryIcons'

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
]

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

function inRange(dt, range) {
  if (range === 'all') return true
  const d = new Date(dt), now = new Date()
  if (range === 'today') return d.toDateString() === now.toDateString()
  if (range === '7d') return d >= new Date(now - 7 * 86400000)
  if (range === '30d') return d >= new Date(now - 30 * 86400000)
  return true
}

function MiniStatCard({ icon, label, value, color, bg }) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

export default function Reports() {
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  const loadData = () => {
    setLoading(true)
    Promise.all([getInventoryItems(), getCategories(), getSuppliers(), getPurchaseOrders(), getAllStockHistory()])
      .then(([i, c, s, o, h]) => { setItems(i); setCategories(c); setSuppliers(s); setOrders(o); setHistory(h) })
      .catch(() => addToast('Failed to load report data', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    window.addEventListener('inventoryUpdated', loadData)
    return () => window.removeEventListener('inventoryUpdated', loadData)
  }, [])

  const filteredHistory = useMemo(() => history.filter(h => inRange(h.changedAt, dateRange)), [history, dateRange])

  const lowStock = items.filter(i => i.quantityInStock > 0 && i.quantityInStock <= i.reorderLevel)
  const outOfStock = items.filter(i => i.quantityInStock <= 0)
  
  const getDiffDays = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0,0,0,0);
    return Math.round((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const expiringSoon = items.filter(i => {
    const diff = getDiffDays(i.expiryDate);
    return diff !== null && diff >= 0 && diff <= 7;
  })
  
  const expired = items.filter(i => {
    const diff = getDiffDays(i.expiryDate);
    return diff !== null && diff < 0;
  })

  const totalValue = items.reduce((s, i) => s + i.quantityInStock * parseFloat(i.unitPrice || 0), 0)

  const recentUpdates = useMemo(() => {
    const seen = new Set()
    return filteredHistory
      .filter(h => { if (seen.has(h.inventoryItem?.id)) return false; seen.add(h.inventoryItem?.id); return true })
      .slice(0, 10)
  }, [filteredHistory])

  const categoryMap = useMemo(() => {
    const m = {}
    items.forEach(i => {
      const name = i.category?.name || 'Unknown'
      if (!m[name]) m[name] = { count: 0, value: 0 }
      m[name].count++
      m[name].value += i.quantityInStock * parseFloat(i.unitPrice || 0)
    })
    return Object.entries(m).sort((a, b) => b[1].count - a[1].count)
  }, [items])

  function downloadReportCSV() {
    if (!items.length) { addToast('No data to export', 'error'); return }
    const lines = [
      ['RestaurantIQ — Daily Inventory Report'],
      [`Generated: ${new Date().toLocaleString('en-IN')}`],
      [`Date Range: ${DATE_RANGES.find(d => d.value === dateRange)?.label}`],
      [],
      ['=== SUMMARY ==='],
      ['Total Inventory Items', items.length],
      ['Low Stock Items', lowStock.length],
      ['Out of Stock Items', outOfStock.length],
      ['Expiring Soon Items', expiringSoon.length],
      ['Expired Items', expired.length],
      ['Recently Updated Items', recentUpdates.length],
      ['Total Inventory Value', `Rs ${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
      ['Total Categories', categories.length],
      ['Total Suppliers', suppliers.length],
      ['Total Purchase Orders', orders.length],
      [],
      ['=== LOW STOCK ITEMS ==='],
      ['Item Name', 'Category', 'In Stock', 'Minimum Stock Limit', 'Unit', 'Expiry Date'],
      ...lowStock.map(i => [i.name, i.category?.name || '', i.quantityInStock, i.reorderLevel, i.unit, i.expiryDate || '—']),
      [],
      ['=== RECENT STOCK UPDATES ==='],
      ['Date & Time', 'Item Name', 'Event Type', 'Previous Qty', 'Change', 'New Qty', 'Notes'],
      ...filteredHistory.slice(0, 20).map(h => [
        fmt(h.changedAt),
        h.inventoryItem?.name || '',
        h.changeType,
        h.previousQuantity != null ? `${h.previousQuantity} ${h.inventoryItem?.unit || ''}` : '',
        `${(h.changeAmount || 0) >= 0 ? '+' : ''}${(h.changeAmount || 0).toFixed(2)}`,
        h.newQuantity != null ? `${h.newQuantity} ${h.inventoryItem?.unit || ''}` : '',
        h.notes || '',
      ]),
      [],
      ['=== TOP CATEGORIES ==='],
      ['Category', 'Item Count', 'Stock Value (Rs)'],
      ...categoryMap.map(([name, d]) => [name, d.count, d.value.toFixed(2)]),
    ]
    const csv = lines.map(r => Array.isArray(r) ? r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') : '').join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    addToast('Report downloaded successfully!', 'success')
  }

  if (loading) return <div className="loading-container"><div className="spinner" /><span className="loading-text">Generating report...</span></div>

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Reports</h1>
          <p>View inventory analytics, stock trends, and operational insights.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="filter-select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <button className="btn btn-primary" onClick={downloadReportCSV} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inventory KPIs</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
        <MiniStatCard icon={<FiPackage />} label="Total Inventory Items" value={items.length} color="#2563eb" bg="#eff6ff" />
        <MiniStatCard icon={<FiAlertTriangle />} label="Low Stock Items" value={lowStock.length} color="#d97706" bg="#fffbeb" />
        <MiniStatCard icon={<FiXCircle />} label="Out of Stock Items" value={outOfStock.length} color="#dc2626" bg="#fef2f2" />
        <MiniStatCard icon={<FiRefreshCw />} label="Recently Updated" value={recentUpdates.length} color="#16a34a" bg="#f0fdf4" />
        <MiniStatCard icon={<FiDollarSign />} label="Total Inventory Value" value={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#7c3aed" bg="#f5f3ff" />
      </div>

      {/* Inventory Summary Card */}
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inventory Summary</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 28 }}>
        <MiniStatCard icon={<FiGrid />} label="Total Categories" value={categories.length} color="#0891b2" bg="#ecfeff" />
        <MiniStatCard icon={<FiUsers />} label="Total Suppliers" value={suppliers.length} color="#2563eb" bg="#eff6ff" />
        <MiniStatCard icon={<FiShoppingCart />} label="Total Purchase Orders" value={orders.length} color="#7c3aed" bg="#f5f3ff" />
        <MiniStatCard icon={<FiCheckCircle />} label="In Stock Items" value={items.filter(i => i.quantityInStock > i.reorderLevel).length} color="#16a34a" bg="#f0fdf4" />
        <MiniStatCard icon={<FiAlertTriangle />} label="Expiring Soon Count" value={expiringSoon.length} color="#d97706" bg="#fffbeb" />
        <MiniStatCard icon={<FiXCircle />} label="Expired Items Count" value={expired.length} color="#dc2626" bg="#fef2f2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Low Stock Alert List */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiAlertTriangle /> Low Stock Items</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{lowStock.length} item{lowStock.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="card-body" style={{ padding: '0 0 16px' }}>
            {lowStock.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8, display: 'flex', justifyContent: 'center', color: 'var(--success)' }}><FiCheckCircle /></div>
                <p>All stock levels are healthy!</p>
              </div>
            ) : (
              <div>
                {lowStock.map(item => {
                  const pct = Math.min(100, (item.quantityInStock / item.reorderLevel) * 100)
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.quantityInStock} {item.unit} · min {item.reorderLevel}</div>
                      </div>
                      <div style={{ width: 80 }}>
                        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct < 30 ? '#ef4444' : '#f59e0b', borderRadius: 4, transition: 'width 0.4s' }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, textAlign: 'right' }}>{Math.round(pct)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiBarChart2 /> Top Categories by Items</h3>
          </div>
          <div className="card-body" style={{ padding: '0 0 16px' }}>
            {categoryMap.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}><p>No category data available</p></div>
            ) : (
              categoryMap.slice(0, 8).map(([name, d], idx) => {
                const max = categoryMap[0][1].count
                const Icon = getCategoryIcon(name)
                return (
                  <div key={name} style={{ padding: '10px 24px', borderBottom: idx < categoryMap.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--text-secondary)' }}><Icon size={14} /></span>
                        {name}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{d.count} items · ₹{d.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(d.count / max) * 100}%`, background: 'var(--primary)', borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Stock Updates */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiClock /> Recent Stock Updates</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{DATE_RANGES.find(d => d.value === dateRange)?.label}</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Item Name</th>
                <th>Event Type</th>
                <th>Previous Qty</th>
                <th>Change</th>
                <th>New Qty</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8, display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}><FiClock /></div>
                    <h3>No activity in this period</h3>
                    <p>Try selecting a different date range</p>
                  </div>
                </td></tr>
              ) : filteredHistory.slice(0, 15).map(h => {
                const changeAmt = h.changeAmount || 0
                const isPos = changeAmt >= 0
                const TYPE_COLORS = { ADDED: '#10b981', REDUCED: '#ef4444', PURCHASE_ORDER: '#2563eb', ITEM_CREATED: '#8b5cf6', ITEM_UPDATED: '#f59e0b' }
                const TYPE_ICONS = { 
                  ADDED: <FiTrendingUp />, 
                  REDUCED: <FiTrendingDown />, 
                  PURCHASE_ORDER: <FiShoppingCart />, 
                  ITEM_CREATED: <FiStar />, 
                  ITEM_UPDATED: <FiEdit2 /> 
                }
                const TYPE_LABELS = { ADDED: 'Stock Added', REDUCED: 'Stock Reduced', PURCHASE_ORDER: 'Purchase Order', ITEM_CREATED: 'Item Created', ITEM_UPDATED: 'Item Updated' }
                return (
                  <tr key={h.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmt(h.changedAt)}</td>
                    <td style={{ fontWeight: 600 }}>{h.inventoryItem?.name || '—'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', fontWeight: 600, color: TYPE_COLORS[h.changeType] || '#64748b', background: `${TYPE_COLORS[h.changeType]}18`, padding: '3px 9px', borderRadius: 20 }}>
                        {TYPE_ICONS[h.changeType]} {TYPE_LABELS[h.changeType] || h.changeType}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{h.previousQuantity != null ? `${h.previousQuantity} ${h.inventoryItem?.unit || ''}` : '—'}</td>
                    <td><span style={{ fontWeight: 700, color: isPos ? '#10b981' : '#ef4444' }}>{isPos ? '+' : ''}{changeAmt.toFixed(2)} {h.inventoryItem?.unit || ''}</span></td>
                    <td style={{ fontWeight: 600 }}>{h.newQuantity != null ? `${h.newQuantity} ${h.inventoryItem?.unit || ''}` : '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 180 }}>{h.notes || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
