import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { getLowStockItems, getInventoryItems } from '../../api/api'
import { FiHome, FiPackage, FiClock, FiBarChart2, FiUsers, FiGrid, FiShoppingCart } from 'react-icons/fi'

const nav = [
  {
    label: 'MAIN', items: [
      { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
      { to: '/inventory', label: 'Inventory', icon: <FiPackage />, alert: true },
      { to: '/history', label: 'Inventory History', icon: <FiClock /> },
      { to: '/reports', label: 'Reports', icon: <FiBarChart2 /> },
    ]
  },
  {
    label: 'MANAGEMENT', items: [
      { to: '/suppliers', label: 'Suppliers', icon: <FiUsers /> },
      { to: '/categories', label: 'Categories', icon: <FiGrid /> },
      { to: '/purchase-orders', label: 'Purchase Orders', icon: <FiShoppingCart /> },
    ]
  }
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const [lowStockCount, setLowStockCount] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    getLowStockItems().then(items => setLowStockCount(items.length)).catch(() => {})
    getInventoryItems().then(items => setTotalItems(items.length)).catch(() => {})
  }, [])

  return (
    <>
      {mobileOpen && <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:998 }} onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon" style={{
              background: 'linear-gradient(135deg, #FF6700 0%, #ea6c0a 100%)',
              boxShadow: '0 4px 12px rgba(255, 103, 0, 0.25)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              flexShrink: 0
            }}>
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                {/* Plate — outer circle */}
                <circle cx="50" cy="50" r="26"/>
                {/* Plate — inner ring */}
                <circle cx="50" cy="50" r="17"/>
                {/* Fork — left side */}
                <line x1="16" y1="22" x2="16" y2="42"/>
                <line x1="11" y1="22" x2="11" y2="31"/>
                <line x1="16" y1="22" x2="16" y2="31"/>
                <line x1="21" y1="22" x2="21" y2="31"/>
                <path d="M11,31 Q16,36 21,31"/>
                <line x1="16" y1="36" x2="16" y2="78"/>
                {/* Spoon — right side */}
                <ellipse cx="84" cy="30" rx="6" ry="9"/>
                <line x1="84" y1="39" x2="84" y2="78"/>
              </svg>
            </div>
            <div>
              <div className="brand-name">RestaurantIQ</div>
              <div className="brand-tagline">Inventory Management</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(section => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                  {item.icon}
                  {item.label}
                  {item.alert && lowStockCount > 0 && <span className="badge-count">{lowStockCount}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px 16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,0.6)' }}></div>
              System Healthy
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, color: '#94a3b8' }}>
              <span>Total Items</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{totalItems}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
              <span>Low Stock Alerts</span>
              <span style={{ color: lowStockCount > 0 ? '#ef4444' : '#fff', fontWeight: 600 }}>{lowStockCount}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
