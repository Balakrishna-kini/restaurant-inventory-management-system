import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const defaultSettings = {
  lowStockNotifs: true,
  poNotifs: true,
  inventoryNotifs: true,
  defaultLowStockThreshold: 10,
  autoRefresh: false
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rims_user')
    return saved ? JSON.parse(saved) : null
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('rims_settings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  })

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('rims_settings', JSON.stringify(updated))
      return updated
    })
  }

  const updateProfile = (profileData) => {
    setUser(prev => {
      const updated = { ...prev, ...profileData }
      localStorage.setItem('rims_user', JSON.stringify(updated))
      return updated
    })
  }

  const login = (username, password) => {
    const storedPassword = localStorage.getItem('rims_admin_password') || 'admin123'
    if (username === 'admin' && password === storedPassword) {
      const userData = { username: 'admin', name: 'Admin Manager', email: 'admin@restaurant.com', role: 'Restaurant Manager' }
      setUser(userData)
      localStorage.setItem('rims_user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, message: 'Invalid credentials.' }
  }

  const changePassword = (currentPassword, newPassword) => {
    const storedPassword = localStorage.getItem('rims_admin_password') || 'admin123'
    if (currentPassword !== storedPassword) {
      return { success: false, message: 'Current password is incorrect.' }
    }
    localStorage.setItem('rims_admin_password', newPassword)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rims_user')
  }

  return (
    <AuthContext.Provider value={{ user, settings, updateSettings, updateProfile, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
