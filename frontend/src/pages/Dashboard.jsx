import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { FiPackage, FiAlertTriangle, FiXCircle, FiRefreshCw, FiClock, FiCheckCircle, FiAward } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa6'
import { getCategoryIcon } from '../utils/categoryIcons'
import { getInventoryItems, getLowStockItems, getCategories, getAllStockHistory, getDashboardSummary } from '../api/api'
import StatCard from '../components/UI/StatCard'
import { StockBadge } from '../components/UI/Badge'

const CustomAxisTick = (props) => {
  const { x, y, payload } = props;
  const catName = payload.value;
  const Icon = getCategoryIcon(catName);
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-30} y={0} width={60} height={40}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color="#64748b" />
          <span style={{ fontSize: 10, color: '#64748b', marginTop: 4, whiteSpace: 'nowrap' }}>{catName}</span>
        </div>
      </foreignObject>
    </g>
  );
};

const CustomBarLabel = (props) => {
  const { x, y, width, value, index, chartView } = props;
  const isHighest = index === 0;
  const displayVal = chartView === 'value' ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : value;
  return (
    <g transform={`translate(${x + width / 2},${y - 10})`}>
      {isHighest && (
        <foreignObject x={-40} y={-24} width={80} height={20}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, fontSize: '9px', background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 'bold' }}>
            <FiAward size={10} /> HIGHEST
          </div>
        </foreignObject>
      )}
      <text x={0} y={0} fill="#64748b" fontSize={11} fontWeight={600} textAnchor="middle">{displayVal}</text>
    </g>
  );
};

export default function Dashboard() {
  const [data, setData] = useState({ items: [], lowStock: [], categories: [], history: [], summary: null })
  const [loading, setLoading] = useState(true)
  const [chartView, setChartView] = useState('count')
  const [trendDays, setTrendDays] = useState(7)
  const navigate = useNavigate()

  const loadData = () => {
    Promise.all([getInventoryItems(), getLowStockItems(), getCategories(), getAllStockHistory(), getDashboardSummary()])
      .then(([items, lowStock, categories, history, summary]) => setData({ items, lowStock, categories, history, summary }))
      .catch(console.error)
      .finally(() => setLoading(false))
  };

  useEffect(() => {
    loadData();
    window.addEventListener('inventoryUpdated', loadData);
    return () => window.removeEventListener('inventoryUpdated', loadData);
  }, [])

  const outOfStock = data.items.filter(i => i.quantityInStock <= 0)

  const getDiffDays = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0,0,0,0);
    return Math.round((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const expired = data.items.filter(i => {
    const diff = getDiffDays(i.expiryDate);
    return diff !== null && diff < 0;
  })

  const expiresToday = data.items.filter(i => {
    const diff = getDiffDays(i.expiryDate);
    return diff !== null && diff === 0;
  })

  const expiringSoon = data.items.filter(i => {
    const diff = getDiffDays(i.expiryDate);
    return diff !== null && diff >= 1 && diff <= 7;
  })

  // Calculate Recently Updated Items based on unique items modified recently (last 24 hours or latest updates from history)
  const historyList = data.history || []
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
  const recentHistory = historyList.filter(h => new Date(h.changedAt) >= oneDayAgo)

  const uniqueUpdatedItems = new Set()
  if (recentHistory.length > 0) {
    recentHistory.forEach(h => {
      if (h.inventoryItem?.id) uniqueUpdatedItems.add(h.inventoryItem.id)
    })
  } else {
    // If no updates in 24 hours, take unique items from the 5 most recent history records so it remains dynamic
    const latestEvents = historyList.slice(0, 5)
    latestEvents.forEach(h => {
      if (h.inventoryItem?.id) uniqueUpdatedItems.add(h.inventoryItem.id)
    })
  }

  const recentlyUpdatedCount = data.summary?.recentlyUpdatedItems || uniqueUpdatedItems.size
  const recentChangeText = recentHistory.length > 0 ? 'Updated in the last 24 hours' : 'Recent inventory activity'
  
  const totalValue = data.summary ? data.summary.totalInventoryValue : data.items.reduce((s, i) => s + (i.quantityInStock * parseFloat(i.unitPrice || 0)), 0)
  const totalItemsCount = data.summary ? data.summary.totalItems : data.items.length
  const lowStockCount = data.summary ? data.summary.lowStockItems : data.lowStock.length
  const outOfStockCount = data.summary ? data.summary.outOfStockItems : outOfStock.length
  
  const expiredCount = data.summary ? data.summary.expiredItems : expired.length
  const expiresTodayCount = data.summary ? data.summary.expiresTodayItems : expiresToday.length
  const expiringSoonCount = data.summary ? data.summary.expiringSoonItems : expiringSoon.length

  const chartData = data.categories.map(cat => {
    const catItems = data.items.filter(i => i.category?.id === cat.id);
    const val = catItems.reduce((s, i) => s + (i.quantityInStock * parseFloat(i.unitPrice || 0)), 0);
    return {
      id: cat.id,
      name: cat.name.split(' ')[0],
      fullName: cat.name,
      count: catItems.length,
      value: val
    };
  }).filter(d => d.count > 0)

  const sortedChartData = [...chartData].sort((a, b) => b[chartView] - a[chartView])
  const topCountCat = [...chartData].sort((a, b) => b.count - a.count)[0]
  const topValueCat = [...chartData].sort((a, b) => b.value - a.value)[0]

  const COLORS = ['#2563eb','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4']

  // --- Start Business Insights & Trends Calculation ---
  const trendMap = {};
  const itemConsumptions = {};
  const itemRestocks = {};

  data.history.forEach(h => {
    if (!h.changedAt || h.changeAmount === undefined) return;
    
    // Process Insights
    if (h.inventoryItem) {
      if (h.changeAmount < 0) itemConsumptions[h.inventoryItem.name] = (itemConsumptions[h.inventoryItem.name] || 0) + Math.abs(h.changeAmount);
      if (h.changeAmount > 0) itemRestocks[h.inventoryItem.name] = (itemRestocks[h.inventoryItem.name] || 0) + h.changeAmount;
    }

    // Process Trend Data
    const dDate = new Date(h.changedAt);
    // Use start of day for accurate day diffs
    const today = new Date();
    today.setHours(0,0,0,0);
    const eventDay = new Date(dDate);
    eventDay.setHours(0,0,0,0);
    
    const diff = Math.round((today - eventDay) / (1000 * 60 * 60 * 24));
    
    if (diff <= trendDays && diff >= 0) {
      const dateStr = eventDay.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (!trendMap[dateStr]) trendMap[dateStr] = { date: dateStr, Added: 0, Reduced: 0 };
      if (h.changeAmount > 0) trendMap[dateStr].Added += h.changeAmount;
      if (h.changeAmount < 0) trendMap[dateStr].Reduced += Math.abs(h.changeAmount);
    }
  });

  const trendData = [];
  let hasTrendData = false;
  for (let i = trendDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const p = trendMap[dateStr] || { date: dateStr, Added: 0, Reduced: 0 };
    if (p.Added > 0 || p.Reduced > 0) hasTrendData = true;
    trendData.push(p);
  }

  // Debugging logs requested by user


  const mostConsumed = Object.entries(itemConsumptions).sort((a, b) => b[1] - a[1])[0];
  const mostRestocked = Object.entries(itemRestocks).sort((a, b) => b[1] - a[1])[0];
  const urgentAttentionCount = data.lowStock.length + expired.length + expiresToday.length;
  // --- End Business Insights ---

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="loading-text">Loading dashboard...</span>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your inventory overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          iconClass="blue" value={data.items.length} label="Total Inventory Items"
          change={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} total value`} changeType="up"
          icon={<FiPackage />}
        />
        <StatCard
          iconClass="amber" value={data.lowStock.length} label="Low Stock Items"
          change={data.lowStock.length > 0 ? 'Needs restocking soon' : 'All levels healthy'} changeType={data.lowStock.length > 0 ? 'warn' : 'up'}
          icon={<FiAlertTriangle />}
        />
        <StatCard
          iconClass="red" value={outOfStock.length} label="Out of Stock Items"
          change={outOfStock.length > 0 ? 'Immediate action needed' : 'No items out of stock'} changeType={outOfStock.length > 0 ? 'down' : 'up'}
          icon={<FiXCircle />}
        />
        <StatCard
          iconClass="green" value={recentlyUpdatedCount} label="Recently Updated Items"
          change={recentChangeText} changeType="up"
          icon={<FiRefreshCw />}
        />
      </div>

      {/* Charts + Alerts */}
      <div className="dashboard-grid">
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3>Inventory Breakdown by Category</h3>
            <div style={{ display: 'flex', gap: 8, background: 'var(--bg)', padding: 4, borderRadius: 24, border: '1px solid var(--border)' }}>
              <button 
                className={`btn btn-sm ${chartView === 'count' ? 'btn-primary' : ''}`} 
                onClick={() => setChartView('count')}
                style={{ borderRadius: 20, background: chartView === 'count' ? 'var(--primary)' : 'transparent', color: chartView === 'count' ? '#fff' : 'var(--text-secondary)', boxShadow: chartView === 'count' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none' }}
              >
                By Items
              </button>
              <button 
                className={`btn btn-sm ${chartView === 'value' ? 'btn-primary' : ''}`} 
                onClick={() => setChartView('value')}
                style={{ borderRadius: 20, background: chartView === 'value' ? 'var(--primary)' : 'transparent', color: chartView === 'value' ? '#fff' : 'var(--text-secondary)', boxShadow: chartView === 'value' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none' }}
              >
                By Inventory Value
              </button>
            </div>
          </div>
          <div className="card-body">
            {sortedChartData.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, flexWrap: 'wrap' }}>
                  {topCountCat && (() => {
                    const TopCatIcon = getCategoryIcon(topCountCat.fullName);
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        <TopCatIcon color="var(--primary)" size={16} />
                        <span style={{ color: 'var(--text-secondary)' }}>Top Category: </span>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{topCountCat.fullName}</span>
                      </div>
                    );
                  })()}
                  {topValueCat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                      <FiAward color="#eab308" size={16} />
                      <span style={{ color: 'var(--text-secondary)' }}>Highest Value: </span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>₹{topValueCat.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                </div>
                <div className="chart-container" style={{ minHeight: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedChartData} margin={{ top: 35, right: 10, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={<CustomAxisTick />} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                            const catName = p.fullName || p.name;
                            const Icon = getCategoryIcon(catName);
                            const totalViewValue = sortedChartData.reduce((s, i) => s + i[chartView], 0);
                            const percent = Math.round((p[chartView] / totalViewValue) * 100);
                            return (
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                  <Icon size={16} color="var(--primary)" />
                                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{catName}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  Items: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{p.count}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  Value: <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{p.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  Contribution: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{percent}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey={chartView} 
                        radius={[8, 8, 0, 0]} 
                        onClick={(data) => navigate(`/inventory?category=${data.id}`)}
                        isAnimationActive={true}
                        animationDuration={500}
                      >
                        <LabelList 
                          dataKey={chartView} 
                          content={<CustomBarLabel chartView={chartView} />}
                        />
                        {sortedChartData.map((d, i) => (
                          <Cell 
                            key={i} 
                            fill={COLORS[i % COLORS.length]} 
                            opacity={i === 0 ? 1 : 0.6}
                            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: 8, color: 'var(--text)' }}>Category Insights:</h4>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li><span style={{ fontWeight: 600 }}>{topCountCat?.fullName}</span> contain the highest number of items.</li>
                    <li><span style={{ fontWeight: 600 }}>{topValueCat?.fullName}</span> have the highest inventory value.</li>
                    {data.lowStock.length > 0 && <li><span style={{ fontWeight: 600 }}>{data.lowStock.length}</span> items require restocking attention across your categories.</li>}
                  </ul>
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '50px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12, color: 'var(--primary)' }}><FiPackage /></div>
                <p style={{ fontWeight: 600, color: 'var(--text)' }}>No inventory data available.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add inventory items to see category analytics.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Low Stock Panel */}
          <div className="card">
          <div className="card-header">
            <h3>⚠️ Low Stock Alerts</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inventory')}>View All</button>
          </div>
          <div className="card-body">
            {data.lowStock.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                <p>All stock levels are healthy!</p>
              </div>
            ) : (
              <div className="low-stock-list">
                {data.lowStock.slice(0, 6).map(item => {
                  const pct = Math.min(100, (item.quantityInStock / item.reorderLevel) * 100)
                  const cls = item.quantityInStock <= 0 ? 'critical' : pct < 50 ? 'low' : 'ok'
                  return (
                    <div key={item.id} className="low-stock-item">
                      <div>
                        <div className="low-stock-name">{item.name}</div>
                        <div className="low-stock-meta">{item.quantityInStock} {item.unit} remaining · min {item.reorderLevel}</div>
                      </div>
                      <div className="stock-bar">
                        <div className="stock-bar-track">
                          <div className={`stock-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

          {/* Expiry Overview Panel */}
          <div className="card" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
            <div className="card-header">
              <h3>📅 Expiry Overview</h3>
              <span className="badge badge-warning">{expiredCount + expiresTodayCount + expiringSoonCount} Alerts</span>
            </div>
            <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        <FiXCircle size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>Expired Items</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Already expired</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#dc2626' }}>{expiredCount}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        <FiClock size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>Expires Today</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>0 days remaining</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c2410c' }}>{expiresTodayCount}</div>
                  </div>


                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef9c3', color: '#a16207', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        <FiAlertTriangle size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>Expiring Soon</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1-7 days remaining</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a16207' }}>{expiringSoonCount}</div>
                  </div>

                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Insights & Trends */}
      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {/* Line Chart */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3>Stock Movement Trends</h3>
            <div style={{ display: 'flex', gap: 8, background: 'var(--bg)', padding: 4, borderRadius: 24, border: '1px solid var(--border)' }}>
              <button 
                className={`btn btn-sm ${trendDays === 7 ? 'btn-primary' : ''}`} 
                onClick={() => setTrendDays(7)}
                style={{ borderRadius: 20, background: trendDays === 7 ? 'var(--primary)' : 'transparent', color: trendDays === 7 ? '#fff' : 'var(--text-secondary)', boxShadow: trendDays === 7 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none' }}
              >
                Last 7 Days
              </button>
              <button 
                className={`btn btn-sm ${trendDays === 30 ? 'btn-primary' : ''}`} 
                onClick={() => setTrendDays(30)}
                style={{ borderRadius: 20, background: trendDays === 30 ? 'var(--primary)' : 'transparent', color: trendDays === 30 ? '#fff' : 'var(--text-secondary)', boxShadow: trendDays === 30 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none' }}
              >
                Last 30 Days
              </button>
            </div>
          </div>
          <div className="card-body" style={{ height: 360, minHeight: 360 }}>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>Date: {label}</div>
                            <div style={{ fontSize: '0.9rem', color: '#16a34a', display: 'flex', justifyContent: 'space-between', width: '120px', marginBottom: 4 }}>
                              <span>Added:</span> <span style={{ fontWeight: 700 }}>{payload[0].value}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#dc2626', display: 'flex', justifyContent: 'space-between', width: '120px' }}>
                              <span>Reduced:</span> <span style={{ fontWeight: 700 }}>{payload[1].value}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="Added" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#16a34a' }} />
                  <Line type="monotone" dataKey="Reduced" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#dc2626' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '50px 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12, color: 'var(--primary)' }}><FiPackage /></div>
                <p style={{ fontWeight: 600, color: 'var(--text)' }}>No stock movement data available</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock activity from the last {trendDays} days will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Insights Panel */}
        <div className="card">
          <div className="card-header">
            <h3>💡 Business Insights</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Most Consumed Item</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>{mostConsumed ? mostConsumed[0] : '—'}</span>
             </div>
             <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Most Restocked Item</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>{mostRestocked ? mostRestocked[0] : '—'}</span>
             </div>
             <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Highest Value Category</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>{topValueCat?.fullName || '—'}</span>
             </div>
             <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Urgent Attention Required</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: urgentAttentionCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {urgentAttentionCount} {urgentAttentionCount === 1 ? 'Item' : 'Items'}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Inventory Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3>Recent Inventory Items</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/inventory')}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zm-3.72 6.53a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0l3 3a.75.75 0 11-1.06 1.06L11 8.06v.69a.75.75 0 01-1.5 0v-.69L7.78 9.53a.75.75 0 01-1.06 0z" clipRule="evenodd"/></svg>
            Manage
          </button>
        </div>
        <div className="card-body" style={{ padding: '0 0 0 0' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Item Name</th><th>Category</th><th>Stock</th><th>Minimum Stock Limit</th><th>Unit Price</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.items.slice(0, 5).map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td><span className="badge badge-info">{item.category?.name}</span></td>
                    <td>{item.quantityInStock} {item.unit}</td>
                    <td>{item.reorderLevel} {item.unit}</td>
                    <td>₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td><StockBadge qty={item.quantityInStock} reorder={item.reorderLevel} /></td>
                  </tr>
                ))}
                {data.items.length === 0 && <tr><td colSpan={6}><div className="empty-state">No items yet</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
