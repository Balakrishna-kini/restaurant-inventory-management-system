import { useEffect, useState, useMemo } from 'react'
import { getAllStockHistory, getStockHistoryByType } from '../api/api'
import { useToast } from '../context/ToastContext'

import { FiTrendingUp, FiTrendingDown, FiShoppingCart, FiStar, FiEdit2, FiClock, FiPlusCircle, FiMinusCircle, FiAlertCircle, FiSearch, FiDownload, FiFilter } from 'react-icons/fi'
import useTable from '../hooks/useTable'
import Pagination from '../components/UI/Pagination'

const TYPE_CONFIG = {
  ADDED: { label: 'Stock Added', color: '#10b981', bg: '#f0fdf4', icon: <FiTrendingUp /> },
  REDUCED: { label: 'Stock Reduced', color: '#ef4444', bg: '#fef2f2', icon: <FiTrendingDown /> },
  PURCHASE_ORDER: { label: 'Purchase Order', color: '#2563eb', bg: '#eff6ff', icon: <FiShoppingCart /> },
  ITEM_CREATED: { label: 'Item Created', color: '#8b5cf6', bg: '#f5f3ff', icon: <FiStar /> },
  ITEM_UPDATED: { label: 'Item Updated', color: '#f59e0b', bg: '#fffbeb', icon: <FiEdit2 /> },
}

function formatDateTime(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

function exportHistoryCSV(data, addToast) {
  if (!data.length) { addToast('No history records to export', 'error'); return }
  const TYPE_LABELS = { ADDED:'Stock Added', REDUCED:'Stock Reduced', PURCHASE_ORDER:'Purchase Order', ITEM_CREATED:'Item Created', ITEM_UPDATED:'Item Updated' }
  const headers = ['Date & Time','Item Name','Event Type','Previous Quantity','Quantity Change','New Quantity','Expiry Date','Notes']
  const rows = data.map(h => [
    formatDateTime(h.changedAt),
    h.inventoryItem?.name || '',
    TYPE_LABELS[h.changeType] || h.changeType,
    h.previousQuantity != null ? `${h.previousQuantity} ${h.inventoryItem?.unit || ''}` : '',
    `${(h.changeAmount || 0) >= 0 ? '+' : ''}${(h.changeAmount || 0).toFixed(2)} ${h.inventoryItem?.unit || ''}`,
    h.newQuantity != null ? `${h.newQuantity} ${h.inventoryItem?.unit || ''}` : '',
    h.inventoryItem?.expiryDate || '—',
    h.notes || '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `inventory-history-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  URL.revokeObjectURL(url)
  addToast(`Exported ${data.length} records to CSV`, 'success')
}

export default function History() {
  const { addToast } = useToast()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    getAllStockHistory()
      .then(setHistory)
      .catch(() => addToast('Failed to load history', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    return history.filter(h => {
      const matchType = !typeFilter || h.changeType === typeFilter
      const matchSearch = !search || h.inventoryItem?.name?.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [history, typeFilter, search])

  const {
    currentData: pagedData,
    handleSort,
    renderSortIcon,
    currentPage,
    totalPages,
    totalRecords,
    startIndex,
    endIndex,
    goToPage
  } = useTable(filtered, 'changedAt', 'desc', 10)

  const summary = {
    total: history.length,
    added: history.filter(h => h.changeType === 'ADDED' || h.changeType === 'PURCHASE_ORDER').length,
    reduced: history.filter(h => h.changeType === 'REDUCED').length,
    created: history.filter(h => h.changeType === 'ITEM_CREATED').length,
  }

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="loading-text">Loading history...</span>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Inventory History</h1>
        <p>Track all inventory stock movements and updates.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Events', value: summary.total, color: 'var(--primary)', bg: '#eff6ff', icon: <FiClock /> },
          { label: 'Stock Added', value: summary.added, color: '#10b981', bg: '#f0fdf4', icon: <FiPlusCircle /> },
          { label: 'Stock Reduced', value: summary.reduced, color: '#ef4444', bg: '#fef2f2', icon: <FiMinusCircle /> },
          { label: 'Items Created', value: summary.created, color: '#8b5cf6', bg: '#f5f3ff', icon: <FiStar /> },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, background: c.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, color: c.color }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FiSearch size={18} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search history..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Event Types</option>
          <option value="ADDED">Stock Added</option>
          <option value="REDUCED">Stock Reduced</option>
          <option value="PURCHASE_ORDER">Purchase Order</option>
          <option value="ITEM_CREATED">Item Created</option>
          <option value="ITEM_UPDATED">Item Updated</option>
        </select>
        <div className="toolbar-right">
          <button className="btn btn-ghost" onClick={() => exportHistoryCSV(filtered, addToast)} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <FiDownload /> Export CSV
          </button>
          <button className="btn btn-ghost" onClick={load}>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" /></svg>
            Refresh
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => handleSort('changedAt')}>Date & Time{renderSortIcon('changedAt')}</th>
                <th onClick={() => handleSort('inventoryItem.name')}>Item Name{renderSortIcon('inventoryItem.name')}</th>
                <th onClick={() => handleSort('changeType')}>Event Type{renderSortIcon('changeType')}</th>
                <th>Previous Qty</th>
                <th>Change</th>
                <th>New Qty</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <FiAlertCircle size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                    <h3>No history records found</h3>
                    <p>History is recorded automatically when stock changes occur</p>
                  </div>
                </td></tr>
              ) : pagedData.map((h, i) => {
                const cfg = TYPE_CONFIG[h.changeType] || { label: h.changeType, color: '#64748b', bg: '#f1f5f9', icon: <FiClock /> }
                const changeAmt = h.changeAmount || 0
                const isPositive = changeAmt >= 0
                return (
                  <tr key={h.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{(currentPage - 1) * 10 + i + 1}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(h.changedAt)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.inventoryItem?.name || '—'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {h.previousQuantity !== null ? `${h.previousQuantity} ${h.inventoryItem?.unit || ''}` : '—'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: isPositive ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                        {isPositive ? '+' : ''}{changeAmt?.toFixed(2)} {h.inventoryItem?.unit || ''}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {h.newQuantity !== null ? `${h.newQuantity} ${h.inventoryItem?.unit || ''}` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 200 }}>
                      {h.notes || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={goToPage}
        />
      </div>
    </div>
  )
}
