import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FiUser, FiMail, FiShield, FiEdit2, FiCheck, FiX } from 'react-icons/fi'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { addToast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarInitials: user?.avatarInitials || user?.name?.[0] || 'A'
  })

  const handleSave = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('Name and Email are required', 'error')
      return
    }
    
    // Update the profile context
    updateProfile({
      name: formData.name,
      email: formData.email,
      avatarInitials: formData.name[0].toUpperCase()
    })
    
    addToast('Profile updated successfully', 'success')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      avatarInitials: user?.avatarInitials || user?.name?.[0] || 'A'
    })
    setIsEditing(false)
  }

  const avatarChar = user?.avatarInitials || user?.name?.[0] || 'A'

  return (
    <div className="page-container fade-in" style={{ padding: '20px 28px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage your personal account details.</p>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <FiEdit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      <div className="stat-card" style={{ padding: 32 }}>
        {/* Avatar Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: '50%', background: 'var(--primary)', 
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '3rem', fontWeight: 600, boxShadow: '0 8px 16px rgba(37,99,235,0.2)',
            marginBottom: 16
          }}>
            {isEditing ? formData.name?.[0]?.toUpperCase() || 'A' : avatarChar}
          </div>
          {!isEditing && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{user?.name}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>{user?.role}</p>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{ maxWidth: 400, margin: '0 auto' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 12, color: 'var(--text-muted)' }}>
                  <FiUser size={16} />
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Enter your full name"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 12, color: 'var(--text-muted)' }}>
                  <FiMail size={16} />
                </div>
                <input 
                  type="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="Enter your email"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, left: 12, color: 'var(--text-muted)' }}>
                  <FiShield size={16} />
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  value={user?.role || 'Manager'} 
                  disabled
                  style={{ paddingLeft: 36, background: 'var(--bg)', cursor: 'not-allowed' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Role cannot be changed.</p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <FiCheck /> Save Profile
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancel} style={{ flex: 1, justifyContent: 'center' }}>
                <FiX /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Full Name</div>
                <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>{user?.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0fdf4', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiMail size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email Address</div>
                <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>{user?.email || 'admin@restaurant.com'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fef2f2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiShield size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Account Role</div>
                <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>{user?.role}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
