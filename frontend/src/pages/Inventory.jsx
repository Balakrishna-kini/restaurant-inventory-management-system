import { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getInventoryItems, getCategories, getSuppliers, createInventoryItem, updateInventoryItem, deleteInventoryItem, updateStock, reduceStock } from '../api/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/UI/Modal'
import { StockBadge } from '../components/UI/Badge'
import { FiSearch, FiDownload, FiPlus, FiPackage, FiEdit2, FiTrash2, FiRefreshCw, FiAlertTriangle, FiTrendingUp, FiTrendingDown, FiXCircle, FiClock, FiCheckCircle } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa6'
import { getCategoryIcon } from '../utils/categoryIcons'
import useTable from '../hooks/useTable'
import Pagination from '../components/UI/Pagination'

function statusLabel(qty, reorder) {
  if (qty <= 0) return 'Out of Stock'
  if (qty <= reorder) return 'Low Stock'
  return 'In Stock'
}

function exportInventoryCSV(items, addToast) {
  if (!items.length) { addToast('No items to export', 'error'); return }
  const headers = ['Item Name','Category','Supplier','Unit','Stock Quantity','Minimum Stock Limit','Unit Price (₹)','Status']
  const rows = items.map(i => [
    i.name, i.category?.name || '', i.supplier?.name || '', i.unit,
    i.quantityInStock, i.reorderLevel, parseFloat(i.unitPrice).toFixed(2),
    statusLabel(i.quantityInStock, i.reorderLevel),
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `inventory-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  URL.revokeObjectURL(url)
  addToast(`Exported ${items.length} items to CSV`, 'success')
}

const empty = { name: '', description: '', unit: 'kg', quantityInStock: '', reorderLevel: '', unitPrice: '', categoryId: '', supplierId: '', expiryDate: '' }

export const getExpiryStatus = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('T')[0].split('-');
  const expiry = new Date(year, month - 1, day);
  const now = new Date();
  now.setHours(0,0,0,0);
  const diffDays = Math.round((expiry - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: <><FiXCircle /> Expired</>, type: 'danger', days: diffDays };
  if (diffDays === 0) return { label: <><FiClock /> Expires Today</>, type: 'warning-dark-orange', days: diffDays };
  if (diffDays <= 7) return { label: <><FiAlertTriangle /> Expiring Soon</>, type: 'warning', days: diffDays };
  return { label: <><FiCheckCircle /> Fresh</>, type: 'success', days: diffDays };
}

export default function Inventory() {
  const { addToast } = useToast()
  const { settings } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [catFilter, setCatFilter] = useState(searchParams.get('category') || '')
  const [stockFilter, setStockFilter] = useState('')
  const [expiryFilter, setExpiryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // Stock tracking states
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [stockItem, setStockItem] = useState(null)
  const [stockForm, setStockForm] = useState({ type: 'increase', quantity: '', notes: '' })
  const [savingStock, setSavingStock] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getInventoryItems(), getCategories(), getSuppliers()])
      .then(([i, c, s]) => { setItems(i); setCategories(c); setSuppliers(s) })
      .catch(() => addToast('Failed to load inventory', 'error'))
      .finally(() => setLoading(false))
  }
  
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (settings?.autoRefresh) {
      const interval = setInterval(load, 30000)
      return () => clearInterval(interval)
    }
  }, [settings?.autoRefresh])

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = !catFilter || item.category?.id === parseInt(catFilter)
      const matchStock = !stockFilter ||
        (stockFilter === 'out' && item.quantityInStock <= 0) ||
        (stockFilter === 'low' && item.quantityInStock > 0 && item.quantityInStock <= item.reorderLevel) ||
        (stockFilter === 'ok' && item.quantityInStock > item.reorderLevel)
      
      const expiryStatus = getExpiryStatus(item.expiryDate)
      const matchExpiry = !expiryFilter ||
        (expiryFilter === 'fresh' && expiryStatus?.type === 'success') ||
        (expiryFilter === 'soon' && expiryStatus?.type === 'warning') ||
        (expiryFilter === 'today' && expiryStatus?.type === 'warning-dark-orange') ||
        (expiryFilter === 'expired' && expiryStatus?.type === 'danger') ||
        (expiryFilter === 'none' && !expiryStatus)
        
      return matchSearch && matchCat && matchStock && matchExpiry
    })
  }, [items, search, catFilter, stockFilter, expiryFilter])

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
  } = useTable(filtered, 'name', 'asc', 10)

  const openAdd = () => { setEditItem(null); setForm({ ...empty, reorderLevel: settings?.defaultLowStockThreshold || 10 }); setModalOpen(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name, description: item.description || '', unit: item.unit, quantityInStock: item.quantityInStock, reorderLevel: item.reorderLevel, unitPrice: item.unitPrice, categoryId: item.category?.id || '', supplierId: item.supplier?.id || '', expiryDate: item.expiryDate || '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { name: form.name, description: form.description, unit: form.unit, quantityInStock: parseFloat(form.quantityInStock), reorderLevel: parseFloat(form.reorderLevel), unitPrice: parseFloat(form.unitPrice), expiryDate: form.expiryDate || null }
      if (editItem) { await updateInventoryItem(editItem.id, payload, form.categoryId, form.supplierId || null); addToast('Item updated!', 'success') }
      else { await createInventoryItem(payload, form.categoryId, form.supplierId || null); addToast('Item added!', 'success') }
      setModalOpen(false); load()
    } catch { addToast('Failed to save item', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await deleteInventoryItem(deleteId); addToast('Item deleted', 'success'); setDeleteId(null); load() }
    catch { addToast('Failed to delete item', 'error') }
  }

  const openStockUpdate = (item) => {
    setStockItem(item)
    setStockForm({ type: 'increase', quantity: '', notes: '' })
    setStockModalOpen(true)
  }

  const handleStockUpdate = async (e) => {
    e.preventDefault()
    if (!stockItem) return
    const qtyChange = parseFloat(stockForm.quantity)
    if (isNaN(qtyChange) || qtyChange <= 0) {
      addToast('Quantity change must be a positive number', 'error')
      return
    }
    if (stockForm.type === 'reduce' && stockItem.quantityInStock - qtyChange < 0) {
      addToast(`Cannot reduce stock below 0. Available: ${stockItem.quantityInStock} ${stockItem.unit}`, 'error')
      return
    }
    setSavingStock(true)
    try {
      if (stockForm.type === 'increase') {
        const newQty = stockItem.quantityInStock + qtyChange
        await updateStock(stockItem.id, newQty, stockForm.notes)
        addToast('Stock increased successfully!', 'success')
      } else {
        await reduceStock(stockItem.id, qtyChange, stockForm.notes)
        addToast('Stock reduced successfully!', 'success')
      }
      setStockModalOpen(false)
      load()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update stock'
      addToast(msg, 'error')
    } finally {
      setSavingStock(false)
    }
  }

  if (loading) return <div className="loading-container"><div className="spinner" /><span className="loading-text">Loading inventory...</span></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Manage inventory items, stock levels, suppliers, and categories.</p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FiSearch size={18} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="filter-select" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option value="">All Stock Levels</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <select className="filter-select" value={expiryFilter} onChange={e => setExpiryFilter(e.target.value)}>
          <option value="">All Items</option>
          <option value="expired">Expired</option>
          <option value="today">Expires Today</option>
          <option value="soon">Expiring Soon (1-7 Days)</option>
          <option value="fresh">Fresh (&gt;7 Days)</option>
          <option value="none">No Expiry Date</option>
        </select>
        <div className="toolbar-right">
          <button className="btn btn-ghost" onClick={() => exportInventoryCSV(filtered, addToast)} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <FiDownload /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <FiPlus /> Add Item
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Item Name{renderSortIcon('name')}</th>
                <th onClick={() => handleSort('category.name')}>Category{renderSortIcon('category.name')}</th>
                <th>Supplier</th>
                <th>Unit</th>
                <th onClick={() => handleSort('quantityInStock')}>In Stock{renderSortIcon('quantityInStock')}</th>
                <th>Minimum Stock Limit</th>
                <th onClick={() => handleSort('unitPrice')}>Unit Price{renderSortIcon('unitPrice')}</th>
                <th>Status</th>
                <th onClick={() => handleSort('expiryDate')}>Expiry Date{renderSortIcon('expiryDate')}</th>
                <th>Expiry Status</th>
                <th onClick={() => handleSort('createdAt')}>Created Date{renderSortIcon('createdAt')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.length === 0 ? (
                <tr><td colSpan={12}>
                  <div className="empty-state">
                    <FiPackage size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                    <h3>No items found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td></tr>
              ) : pagedData.map(item => {
                const exStat = getExpiryStatus(item.expiryDate);
                const bgStyle = exStat?.days < 0 ? '#fef2f2' : 'transparent';
                return (
                <tr key={item.id} style={{ backgroundColor: bgStyle }}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>
                    <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {(() => { const CatIcon = getCategoryIcon(item.category?.name); return <CatIcon size={14} /> })()}
                      {item.category?.name || '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{item.supplier?.name || '—'}</td>
                  <td>{item.unit}</td>
                  <td style={{ fontWeight: 600 }}>{item.quantityInStock}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.reorderLevel}</td>
                  <td>₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td><StockBadge qty={item.quantityInStock} reorder={item.reorderLevel} /></td>
                  <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>
                    {exStat ? (
                      <span title={`Expiry Date: ${new Date(item.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}\nDays Remaining: ${exStat?.days < 0 ? 'Expired' : exStat?.days}`} className={`badge badge-${exStat?.type}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{exStat?.label}</span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openStockUpdate(item)} title="Update Stock" style={{ color: 'var(--primary)' }}>
                        <FiRefreshCw size={15} />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(item)} title="Edit">
                        <FiEdit2 size={15} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(item.id)} title="Delete">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Inventory Item' : 'Add New Item'}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item Name <span>*</span></label>
              <input className="form-control" placeholder="e.g. Tomatoes" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Unit <span>*</span></label>
              <select className="form-control" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                {['kg', 'liters', 'pieces', 'grams', 'packets', 'boxes', 'bottles'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-control" placeholder="Optional description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category <span>*</span></label>
              <select className="form-control" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-control" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>
                <option value="">Select supplier (optional)</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quantity in Stock <span>*</span></label>
              <input className="form-control" type="number" min="0" step="0.01" placeholder="0" value={form.quantityInStock} onChange={e => setForm(p => ({ ...p, quantityInStock: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Stock Limit <span>*</span></label>
              <input className="form-control" type="number" min="0" step="0.01" placeholder="Minimum stock before alert" value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} required />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Unit Price (₹) <span>*</span></label>
              <input className="form-control" type="number" min="0" step="0.01" placeholder="0.00" value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input className="form-control" type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner spinner-sm" />Saving...</> : editItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Stock Modal */}
      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} title={`Update Stock: ${stockItem?.name || ''}`} maxWidth="450px">
        <form onSubmit={handleStockUpdate}>
          <div className="form-group">
            <label className="form-label">Current Stock</label>
            <input className="form-control" type="text" value={stockItem ? `${stockItem.quantityInStock} ${stockItem.unit}` : ''} readOnly style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Update Type <span>*</span></label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input type="radio" name="updateType" checked={stockForm.type === 'increase'} onChange={() => setStockForm(p => ({ ...p, type: 'increase' }))} style={{ accentColor: '#10b981', width: '16px', height: '16px' }} />
                <FiTrendingUp size={16} /> Increase Stock
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input type="radio" name="updateType" checked={stockForm.type === 'reduce'} onChange={() => setStockForm(p => ({ ...p, type: 'reduce' }))} style={{ accentColor: '#ef4444', width: '16px', height: '16px' }} />
                <FiTrendingDown size={16} /> Reduce Stock
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Change ({stockItem?.unit || ''}) <span>*</span></label>
            <input className="form-control" type="number" min="0.01" step="0.01" placeholder="e.g. 5.00" value={stockForm.quantity} onChange={e => setStockForm(p => ({ ...p, quantity: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label className="form-label">Optional Notes</label>
            <input className="form-control" placeholder="e.g. Received weekly delivery / Kitchen consumption" value={stockForm.notes} onChange={e => setStockForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStockModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingStock} style={{ background: stockForm.type === 'increase' ? '#10b981' : '#ef4444', borderColor: stockForm.type === 'increase' ? '#10b981' : '#ef4444' }}>
              {savingStock ? <><span className="spinner spinner-sm" />Saving...</> : stockForm.type === 'increase' ? 'Increase Stock' : 'Reduce Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" maxWidth="400px">
        <div className="confirm-body">
          <div className="confirm-icon">
            <FiAlertTriangle size={24} />
          </div>
          <h3>Delete this item?</h3>
          <p>This action cannot be undone. The item will be permanently removed from inventory.</p>
          <div className="form-actions" style={{ justifyContent: 'center', paddingTop: 12 }}>
            <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
