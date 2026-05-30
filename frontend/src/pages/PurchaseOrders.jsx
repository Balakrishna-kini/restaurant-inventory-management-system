import { useEffect, useState } from 'react'
import { getPurchaseOrders, getInventoryItems, getSuppliers, createPurchaseOrder, updateOrderStatus, deletePurchaseOrder } from '../api/api'
import { useToast } from '../context/ToastContext'
import Modal from '../components/UI/Modal'
import { FiShoppingCart, FiClock, FiCheckCircle, FiAlertTriangle, FiPlus, FiTrash2 } from 'react-icons/fi'
import useTable from '../hooks/useTable'
import Pagination from '../components/UI/Pagination'

const STATUS_COLORS = { PENDING: 'warning', APPROVED: 'info', RECEIVED: 'success', CANCELLED: 'danger' }
const STATUSES = ['PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED']

export default function PurchaseOrders() {
  const { addToast } = useToast()
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ itemId: '', supplierId: '', quantity: '', unitPrice: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [receiveModalOpen, setReceiveModalOpen] = useState(null)
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [receiving, setReceiving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getPurchaseOrders(), getInventoryItems(), getSuppliers()])
      .then(([o, i, s]) => { setOrders(o); setItems(i); setSuppliers(s) })
      .catch(() => addToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders

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
  } = useTable(filtered, 'orderNumber', 'desc', 10)

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createPurchaseOrder({ quantity: parseFloat(form.quantity), unitPrice: parseFloat(form.unitPrice), notes: form.notes }, form.itemId, form.supplierId)
      addToast('Purchase order created!', 'success'); setModalOpen(false)
      setForm({ itemId: '', supplierId: '', quantity: '', unitPrice: '', notes: '' }); load()
    } catch { addToast('Failed to create order', 'error') } finally { setSaving(false) }
  }

  const handleStatusChange = async (id, status, expiryDate = null) => {
    try { 
      await updateOrderStatus(id, status, expiryDate); 
      addToast(`Order marked as ${status}`, 'success'); 
      load();
      if (status === 'RECEIVED') {
         window.dispatchEvent(new CustomEvent('inventoryUpdated'));
         window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      }
    }
    catch { addToast('Failed to update status', 'error') }
  }

  const handleReceiveSubmit = async (e) => {
    e.preventDefault()
    setReceiving(true)
    await handleStatusChange(receiveModalOpen.id, 'RECEIVED', newExpiryDate)
    setReceiving(false)
    setReceiveModalOpen(null)
    setNewExpiryDate('')
  }

  const handleDelete = async () => { try { await deletePurchaseOrder(deleteId); addToast('Order deleted', 'success'); setDeleteId(null); load() } catch { addToast('Failed to delete', 'error') } }

  const totalValue = orders.reduce((s, o) => s + parseFloat(o.totalPrice || 0), 0)
  const pending = orders.filter(o => o.status === 'PENDING').length
  const received = orders.filter(o => o.status === 'RECEIVED').length

  if (loading) return <div className="loading-container"><div className="spinner" /><span className="loading-text">Loading orders...</span></div>

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Purchase Orders</h1><p>Track restocking orders and supplier transactions.</p></div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Orders', value: orders.length, color: 'var(--primary)', bg: '#eff6ff', icon: <FiShoppingCart /> },
          { label: 'Pending', value: pending, color: '#d97706', bg: '#fffbeb', icon: <FiClock /> },
          { label: 'Received', value: received, color: 'var(--success)', bg: '#f0fdf4', icon: <FiCheckCircle /> },
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
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <FiPlus /> New Order
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('orderNumber')}>Order #{renderSortIcon('orderNumber')}</th>
                <th onClick={() => handleSort('inventoryItem.name')}>Item{renderSortIcon('inventoryItem.name')}</th>
                <th onClick={() => handleSort('supplier.name')}>Supplier{renderSortIcon('supplier.name')}</th>
                <th onClick={() => handleSort('quantity')}>Quantity{renderSortIcon('quantity')}</th>
                <th onClick={() => handleSort('unitPrice')}>Unit Price{renderSortIcon('unitPrice')}</th>
                <th onClick={() => handleSort('totalPrice')}>Total{renderSortIcon('totalPrice')}</th>
                <th onClick={() => handleSort('status')}>Status{renderSortIcon('status')}</th>
                <th onClick={() => handleSort('orderDate')}>Created Date{renderSortIcon('orderDate')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.length === 0 ? <tr><td colSpan={9}><div className="empty-state"><h3>No orders found</h3><p>Create your first purchase order</p></div></td></tr>
              : pagedData.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--primary)' }}>{o.orderNumber}</td>
                  <td style={{ fontWeight: 600 }}>{o.inventoryItem?.name || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{o.supplier?.name || '—'}</td>
                  <td>{o.quantity} {o.inventoryItem?.unit}</td>
                  <td>₹{parseFloat(o.unitPrice).toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>₹{parseFloat(o.totalPrice || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${STATUS_COLORS[o.status] || 'neutral'}`}>
                      <span className="badge-dot" />{o.status}
                    </span>
                  </td>
                  <td>{o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>
                    <div className="table-actions">
                      {o.status === 'PENDING' && <>
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(o.id, 'APPROVED')} style={{ fontSize: '0.75rem', padding: '5px 10px' }}>Approve</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(o.id, 'CANCELLED')} style={{ fontSize: '0.75rem', padding: '5px 10px' }}>Cancel</button>
                      </>}
                      {o.status === 'APPROVED' && <button className="btn btn-primary btn-sm" onClick={() => { setReceiveModalOpen(o); setNewExpiryDate(o.inventoryItem?.expiryDate?.split('T')[0] || '') }} style={{ fontSize: '0.75rem', padding: '5px 10px' }}>Mark Received</button>}
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(o.id)}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
        {filtered.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Total value: <strong style={{ color: 'var(--text)', marginLeft: 8 }}>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Purchase Order">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Inventory Item <span>*</span></label>
            <select className="form-control" value={form.itemId} onChange={e => setForm(p => ({ ...p, itemId: e.target.value }))} required>
              <option value="">Select item to restock</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name} (Current: {i.quantityInStock} {i.unit})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier <span>*</span></label>
            <select className="form-control" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))} required>
              <option value="">Select supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Quantity <span>*</span></label><input className="form-control" type="number" min="0.01" step="0.01" placeholder="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Unit Price (₹) <span>*</span></label><input className="form-control" type="number" min="0" step="0.01" placeholder="0.00" value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} required /></div>
          </div>
          {form.quantity && form.unitPrice && <div className="alert alert-success" style={{ marginBottom: 16 }}>Total: <strong>₹{(form.quantity * form.unitPrice).toFixed(2)}</strong></div>}
          <div className="form-group"><label className="form-label">Notes</label><input className="form-control" placeholder="Optional notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner spinner-sm" />Creating...</> : 'Create Order'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Order" maxWidth="400px">
        <div className="confirm-body">
          <div className="confirm-icon"><FiAlertTriangle size={24} /></div>
          <h3>Delete this order?</h3><p>This will permanently remove the purchase order.</p>
          <div className="form-actions" style={{ justifyContent: 'center', paddingTop: 12 }}><button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
        </div>
      </Modal>

      <Modal isOpen={!!receiveModalOpen} onClose={() => setReceiveModalOpen(null)} title="Receive Purchase Order" maxWidth="400px">
        <form onSubmit={handleReceiveSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
              <div style={{ marginBottom: 4 }}>Receiving: <strong style={{ color: 'var(--text)' }}>{receiveModalOpen?.quantity} {receiveModalOpen?.inventoryItem?.unit}</strong> of <strong style={{ color: 'var(--text)' }}>{receiveModalOpen?.inventoryItem?.name}</strong></div>
              <div>Current Expiry Date: <strong>{receiveModalOpen?.inventoryItem?.expiryDate ? receiveModalOpen.inventoryItem.expiryDate.split('T')[0] : 'None'}</strong></div>
            </div>
            <label className="form-label">New Expiry Date (Optional)</label>
            <input className="form-control" type="date" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              Setting a new expiry date will update the item's expiry status and refresh alerts immediately.
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setReceiveModalOpen(null)}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={receiving}>
              {receiving ? <><span className="spinner spinner-sm" />Receiving...</> : 'Confirm Received'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
