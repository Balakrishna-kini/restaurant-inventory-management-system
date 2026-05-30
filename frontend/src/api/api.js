import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })

// Categories
export const getCategories = () => api.get('/categories').then(r => r.data)
export const getCategoryById = (id) => api.get(`/categories/${id}`).then(r => r.data)
export const createCategory = (data) => api.post('/categories', data).then(r => r.data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(r => r.data)

// Suppliers
export const getSuppliers = () => api.get('/suppliers').then(r => r.data)
export const getSupplierById = (id) => api.get(`/suppliers/${id}`).then(r => r.data)
export const searchSuppliers = (name) => api.get(`/suppliers/search?name=${name}`).then(r => r.data)
export const createSupplier = (data) => api.post('/suppliers', data).then(r => r.data)
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data).then(r => r.data)
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`).then(r => r.data)

// Inventory Items
export const getInventoryItems = () => api.get('/inventory').then(r => r.data)
export const getItemById = (id) => api.get(`/inventory/${id}`).then(r => r.data)
export const searchItems = (name) => api.get(`/inventory/search?name=${name}`).then(r => r.data)
export const getItemsByCategory = (id) => api.get(`/inventory/category/${id}`).then(r => r.data)
export const getLowStockItems = () => api.get('/inventory/low-stock').then(r => r.data)
export const getOutOfStockItems = () => api.get('/inventory/out-of-stock').then(r => r.data)
export const getExpiringSoonItems = () => api.get('/inventory/expiring-soon').then(r => r.data)
export const getExpiredItems = () => api.get('/inventory/expired').then(r => r.data)
export const createInventoryItem = (data, categoryId, supplierId) => {
  const params = supplierId ? `?categoryId=${categoryId}&supplierId=${supplierId}` : `?categoryId=${categoryId}`
  return api.post(`/inventory${params}`, data).then(r => r.data)
}
export const updateInventoryItem = (id, data, categoryId, supplierId) => {
  const params = supplierId ? `?categoryId=${categoryId}&supplierId=${supplierId}` : `?categoryId=${categoryId}`
  return api.put(`/inventory/${id}${params}`, data).then(r => r.data)
}
export const updateStock = (id, quantity, notes) => api.patch(`/inventory/${id}/stock`, { quantity, notes }).then(r => r.data)
export const reduceStock = (id, quantity, notes) => api.patch(`/inventory/${id}/reduce-stock`, { quantity, notes }).then(r => r.data)
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`).then(r => r.data)

// Purchase Orders
export const getPurchaseOrders = () => api.get('/purchase-orders').then(r => r.data)
export const getOrderById = (id) => api.get(`/purchase-orders/${id}`).then(r => r.data)
export const getOrdersByStatus = (status) => api.get(`/purchase-orders/status/${status}`).then(r => r.data)
export const createPurchaseOrder = (data, itemId, supplierId) =>
  api.post(`/purchase-orders?itemId=${itemId}&supplierId=${supplierId}`, data).then(r => r.data)
export const updateOrderStatus = (id, status, newExpiryDate) => api.patch(`/purchase-orders/${id}/status`, { status, newExpiryDate }).then(r => r.data)
export const deletePurchaseOrder = (id) => api.delete(`/purchase-orders/${id}`).then(r => r.data)

// Stock History
export const getAllStockHistory = () => api.get('/stock-history').then(r => r.data)
export const getStockHistoryByItem = (itemId) => api.get(`/stock-history/item/${itemId}`).then(r => r.data)
export const getStockHistoryByType = (type) => api.get(`/stock-history/type/${type}`).then(r => r.data)

// Notifications
export const getNotifications = () => api.get('/notifications').then(r => r.data)
export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}/read`).then(r => r.data)
export const markAllNotificationsAsRead = () => api.patch('/notifications/read-all').then(r => r.data)

export const getDashboardSummary = () => api.get('/dashboard/summary').then(r => r.data)

export default api;
