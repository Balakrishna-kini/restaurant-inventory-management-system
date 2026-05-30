import { useEffect, useState } from 'react'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/api'
import { useToast } from '../context/ToastContext'
import Modal from '../components/UI/Modal'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import useTable from '../hooks/useTable'
import Pagination from '../components/UI/Pagination'

const empty = { name: '', email: '', phone: '', address: '', contactPerson: '' }

export default function Suppliers() {
  const { addToast } = useToast()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => { setLoading(true); getSuppliers().then(setSuppliers).catch(() => addToast('Failed to load', 'error')).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))

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

  const openAdd = () => { setEditItem(null); setForm(empty); setModalOpen(true) }
  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, email: s.email || '', phone: s.phone || '', address: s.address || '', contactPerson: s.contactPerson || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) { await updateSupplier(editItem.id, form); addToast('Supplier updated!', 'success') }
      else { await createSupplier(form); addToast('Supplier added!', 'success') }
      setModalOpen(false); load()
    } catch { addToast('Failed to save supplier', 'error') } finally { setSaving(false) }
  }
  const handleDelete = async () => { try { await deleteSupplier(deleteId); addToast('Supplier deleted', 'success'); setDeleteId(null); load() } catch { addToast('Failed to delete', 'error') } }

  if (loading) return <div className="loading-container"><div className="spinner" /><span className="loading-text">Loading suppliers...</span></div>

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Suppliers</h1><p>Manage vendor relationships and supplier information.</p></div>
      <div className="toolbar">
        <div className="search-box">
          <FiSearch size={18} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus /> Add Supplier
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Supplier Name{renderSortIcon('name')}</th>
                <th onClick={() => handleSort('contactPerson')}>Contact Person{renderSortIcon('contactPerson')}</th>
                <th onClick={() => handleSort('email')}>Email{renderSortIcon('email')}</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><h3>No suppliers found</h3></div></td></tr>
              : pagedData.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.contactPerson || '—'}</td>
                  <td><a href={`mailto:${s.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{s.email}</a></td>
                  <td>{s.phone || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 200 }}>{s.address || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(s)}><FiEdit2 size={15} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(s.id)}><FiTrash2 size={15} /></button>
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
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'Add New Supplier'}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Company Name <span>*</span></label><input className="form-control" placeholder="e.g. Fresh Farm Suppliers" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Contact Person</label><input className="form-control" placeholder="e.g. Ravi Kumar" value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} /></div>
          </div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Email <span>*</span></label><input className="form-control" type="email" placeholder="contact@supplier.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Address</label><input className="form-control" placeholder="Street, City" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner spinner-sm" />Saving...</> : editItem ? 'Update' : 'Add Supplier'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" maxWidth="400px">
        <div className="confirm-body">
          <div className="confirm-icon"><FiAlertTriangle size={24} /></div>
          <h3>Delete this supplier?</h3><p>This will permanently remove the supplier from your system.</p>
          <div className="form-actions" style={{ justifyContent: 'center', paddingTop: 12 }}><button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
        </div>
      </Modal>
    </div>
  )
}
