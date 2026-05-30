import { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory, getInventoryItems } from '../api/api'
import { useToast } from '../context/ToastContext'
import Modal from '../components/UI/Modal'
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import { getCategoryIcon } from '../utils/categoryIcons'

const COLORS = ['#2563eb','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16']

export default function Categories() {
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => { setLoading(true); Promise.all([getCategories(), getInventoryItems()]).then(([c, i]) => { setCategories(c); setItems(i) }).catch(() => addToast('Failed to load', 'error')).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditItem(null); setForm({ name: '', description: '' }); setModalOpen(true) }
  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name, description: c.description || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) { await updateCategory(editItem.id, form); addToast('Category updated!', 'success') }
      else { await createCategory(form); addToast('Category added!', 'success') }
      setModalOpen(false); load()
    } catch { addToast('Failed to save', 'error') } finally { setSaving(false) }
  }
  const handleDelete = async () => { try { await deleteCategory(deleteId); addToast('Deleted', 'success'); setDeleteId(null); load() } catch { addToast('Cannot delete category with items', 'warning') } }

  const getItemCount = (catId) => items.filter(i => i.category?.id === catId).length

  if (loading) return <div className="loading-container"><div className="spinner" /><span className="loading-text">Loading categories...</span></div>

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Categories</h1><p>Organize inventory items into logical categories.</p></div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 0 }}>
          <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        {categories.map((cat, i) => {
          const count = getItemCount(cat.id)
          const color = COLORS[i % COLORS.length]
          const Icon = getCategoryIcon(cat.name)
          return (
            <div key={cat.id} className="card" style={{ padding: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{cat.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{cat.description || 'No description'}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', background: `${color}20`, color, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{count} item{count !== 1 ? 's' : ''}</span>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(cat)}><FiEdit2 size={14} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(cat.id)}><FiTrash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {categories.length === 0 && <div className="empty-state"><h3>No categories yet</h3><p>Add your first category to organize inventory</p></div>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Category' : 'Add Category'} maxWidth="480px">
        <form onSubmit={handleSave}>
          <div className="form-group"><label className="form-label">Category Name <span>*</span></label><input className="form-control" placeholder="e.g. Vegetables" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-group"><label className="form-label">Description</label><input className="form-control" placeholder="Brief description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner spinner-sm" />Saving...</> : editItem ? 'Update' : 'Add Category'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" maxWidth="400px">
        <div className="confirm-body">
          <div className="confirm-icon"><FiAlertTriangle size={24} /></div>
          <h3>Delete this category?</h3><p>Note: Categories with existing items cannot be deleted.</p>
          <div className="form-actions" style={{ justifyContent: 'center', paddingTop: 12 }}><button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
        </div>
      </Modal>
    </div>
  )
}
