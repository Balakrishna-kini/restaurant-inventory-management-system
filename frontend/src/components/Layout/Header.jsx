import { useState, useEffect, useRef } from 'react'
import { FiCalendar, FiClock, FiBell, FiAlertTriangle, FiXCircle, FiPackage, FiShoppingCart, FiEdit2, FiTrash2, FiPlus, FiHome, FiBarChart2, FiUsers, FiGrid, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/api'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const [time, setTime] = useState(new Date())
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, settings } = useAuth()

  const pageNames = {
    '/dashboard': 'Dashboard',
    '/inventory': 'Inventory',
    '/history': 'Inventory History',
    '/reports': 'Reports',
    '/suppliers': 'Suppliers',
    '/categories': 'Categories',
    '/purchase-orders': 'Purchase Orders',
    '/settings': 'Settings'
  }
  const currentPage = pageNames[location.pathname] || ''

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadNotifs = async () => {
    try {
      const data = await getNotifications()
      const today = new Date().toDateString()
      let filtered = data.filter(n => {
        if (!settings.lowStockNotifs && ['LOW_STOCK', 'OUT_OF_STOCK', 'ITEM_EXPIRING_SOON', 'ITEM_EXPIRED'].includes(n.type)) return false;
        if (!settings.poNotifs && (n.type === 'PO_CREATED' || n.type === 'PO_RECEIVED')) return false;
        if (!settings.inventoryNotifs && ['STOCK_INCREASED', 'STOCK_REDUCED', 'ITEM_ADDED', 'ITEM_UPDATED', 'ITEM_DELETED'].includes(n.type)) return false;
        
        const notifDate = new Date(n.createdAt).toDateString()
        if (notifDate !== today) return false;

        return true;
      })

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      filtered = filtered.slice(0, 10)

      setNotifications(filtered)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadNotifs()
    window.addEventListener('notificationsUpdated', loadNotifs)
    const interval = setInterval(loadNotifs, 30000)
    return () => {
      clearInterval(interval)
      window.removeEventListener('notificationsUpdated', loadNotifs)
    }
  }, [settings])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = async (id) => {
    const notif = notifications.find(n => n.id === id)
    if (notif && !notif.read) {
      // optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      try {
        await markNotificationAsRead(id)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await markAllNotificationsAsRead()
    } catch (err) {
      console.error(err)
    }
  }

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr)
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 60) return `Just now`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    
    // Yesterday check
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      return 'Yesterday'
    }
    
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) !== 1 ? 's' : ''} ago`
  }

  const getIconForType = (type) => {
    switch (type) {
      case 'LOW_STOCK': return <FiAlertTriangle size={18} color="#f59e0b" />
      case 'OUT_OF_STOCK': return <FiXCircle size={18} color="#ef4444" />
      case 'STOCK_INCREASED': return <FiPackage size={18} color="#10b981" />
      case 'STOCK_REDUCED': return <FiPackage size={18} color="#ef4444" />
      case 'PO_CREATED':
      case 'PO_RECEIVED': return <FiShoppingCart size={18} color="#2563eb" />
      case 'ITEM_ADDED':
      case 'CATEGORY_ADDED':
      case 'SUPPLIER_ADDED': return <FiPlus size={18} color="#10b981" />
      case 'ITEM_UPDATED':
      case 'CATEGORY_UPDATED':
      case 'SUPPLIER_UPDATED': return <FiEdit2 size={18} color="#f59e0b" />
      case 'ITEM_DELETED':
      case 'CATEGORY_DELETED':
      case 'SUPPLIER_DELETED': return <FiTrash2 size={18} color="#ef4444" />
      default: return <FiBell size={18} color="#64748b" />
    }
  }

  const getPageIcon = (path) => {
    switch (path) {
      case '/dashboard': return <FiHome size={20} />
      case '/inventory': return <FiPackage size={20} />
      case '/history': return <FiClock size={20} />
      case '/reports': return <FiBarChart2 size={20} />
      case '/suppliers': return <FiUsers size={20} />
      case '/categories': return <FiGrid size={20} />
      case '/purchase-orders': return <FiShoppingCart size={20} />
      case '/settings': return <FiSettings size={20} />
      default: return null
    }
  }

  return (
    <header className="top-header" style={{ justifyContent: 'space-between' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12 }}>
        {currentPage && (
          <>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text)' }}>
              {getPageIcon(location.pathname)}
            </span>
            <span style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.01em' }}>
              {currentPage}
            </span>
          </>
        )}
      </div>
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <FiCalendar size={15} />
          {time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <FiClock size={15} />
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>

        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="icon-btn" 
            title="Notifications" 
            onClick={() => setShowNotifs(!showNotifs)} 
            style={{ position: 'relative', background: showNotifs ? 'var(--bg)' : 'var(--surface)', border: showNotifs ? '1px solid var(--primary)' : '1px solid var(--border)' }}
          >
            <FiBell size={18} color={showNotifs ? 'var(--primary)' : 'var(--text-secondary)'} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 5px', borderRadius: 10, minWidth: 18, border: '2px solid var(--surface)' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{ position: 'absolute', top: 48, right: 0, width: 360, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Notifications</h3>
                {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }}>Mark all as read</span>}
              </div>
              
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No new notifications today.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      style={{ 
                        padding: '16px 20px', 
                        borderBottom: '1px solid var(--border)', 
                        display: 'flex', 
                        gap: 14, 
                        cursor: 'pointer',
                        background: n.read ? 'var(--surface)' : '#eff6ff',
                        transition: 'background 0.2s',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ marginTop: 2, flexShrink: 0 }}>
                        {getIconForType(n.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.4, fontWeight: n.read ? 500 : 600 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />}
                    </div>
                  ))
                )}
              </div>
              <div 
                style={{ padding: '12px', borderTop: '1px solid var(--border)', textAlign: 'center', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', background: '#f8fafc' }}
                onClick={() => { setShowNotifs(false); navigate('/history'); }}
              >
                View All Activity
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
              width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, 
              fontSize: '0.9rem', cursor: 'pointer', border: '2px solid transparent', 
              transition: 'var(--transition)', borderColor: showProfileMenu ? 'var(--primary-dark)' : 'transparent' 
            }}
          >
            {user?.avatarInitials || user?.name?.[0] || 'A'}
          </div>

          {showProfileMenu && (
            <div style={{ position: 'absolute', top: 48, right: 0, width: 200, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden', padding: '8px 0' }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{user?.name || 'Admin'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role || 'Manager'}</div>
              </div>
              <div 
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
              >
                <FiUser size={16} /> Profile
              </div>
              <div 
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
              >
                <FiSettings size={16} /> Settings
              </div>
              <div 
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--danger)', transition: 'background 0.2s', borderTop: '1px solid var(--border)', marginTop: 4 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => { setShowProfileMenu(false); logout(); }}
              >
                <FiLogOut size={16} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
