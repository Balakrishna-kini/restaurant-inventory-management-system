import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FiUser, FiBell, FiSettings, FiLock, FiCheck } from 'react-icons/fi'
import { markAllNotificationsAsRead } from '../api/api'

export default function Settings() {
  const { user, settings, updateSettings, changePassword, logout } = useAuth()
  const { showToast } = useToast()
  
  // Notification States
  const [lowStockNotifs, setLowStockNotifs] = useState(settings.lowStockNotifs)
  const [poNotifs, setPoNotifs] = useState(settings.poNotifs)
  const [inventoryNotifs, setInventoryNotifs] = useState(settings.inventoryNotifs)
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  // Preference States
  const [defaultThreshold, setDefaultThreshold] = useState(settings.defaultLowStockThreshold)
  const [autoRefresh, setAutoRefresh] = useState(settings.autoRefresh)

  // Password States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSavePreferences = () => {
    updateSettings({
      lowStockNotifs,
      poNotifs,
      inventoryNotifs,
      defaultLowStockThreshold: Number(defaultThreshold) || 10,
      autoRefresh
    })
    showToast('Settings saved successfully', 'success')
  }

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true)
    try {
      await markAllNotificationsAsRead()
      showToast('All notifications marked as read', 'success')
    } catch (err) {
      showToast('Failed to mark notifications as read', 'error')
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }
    
    const result = changePassword(currentPassword, newPassword)
    if (result.success) {
      showToast('Password changed successfully. Please log in again.', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => logout(), 1500)
    } else {
      showToast(result.message, 'error')
    }
  }

  return (
    <div className="page-container fade-in" style={{ padding: '20px 28px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage your account preferences and application settings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSavePreferences}>
          <FiCheck /> Save Changes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Profile Section */}
          <div className="stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser size={18} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>My Profile</h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600 }}>
                {user?.name?.[0] || 'A'}
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)' }}>{user?.name || 'Admin Manager'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email || 'admin@restaurant.com'}</div>
                <div style={{ display: 'inline-block', padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, marginTop: 8 }}>
                  {user?.role || 'System Admin'}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdf4', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiSettings size={18} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Inventory Preferences</h2>
            </div>
            
            <div className="form-group">
              <label className="form-label">Default Low Stock Threshold</label>
              <input 
                type="number" 
                className="form-control" 
                value={defaultThreshold} 
                onChange={(e) => setDefaultThreshold(e.target.value)}
                min="0"
                style={{ width: '100%', maxWidth: 200 }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                New inventory items will use this threshold if not specified.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>Auto Refresh Data</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automatically refresh inventory and dashboard data</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Notifications Section */}
          <div className="stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiBell size={18} />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Notification Settings</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead} disabled={isMarkingRead}>
                Mark All Read
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>Low Stock Alerts</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive alerts when items drop below threshold</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={lowStockNotifs} onChange={(e) => setLowStockNotifs(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>Purchase Order Updates</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notify when POs are created or received</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={poNotifs} onChange={(e) => setPoNotifs(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>Inventory Edits</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notify on manual inventory adjustments</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={inventoryNotifs} onChange={(e) => setInventoryNotifs(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                </label>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiLock size={18} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Security</h2>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                Change Password
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
