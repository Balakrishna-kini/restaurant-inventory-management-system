export default function StatCard({ icon, label, value, change, changeType = 'up', iconClass = 'blue' }) {
  const arrow = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '⚠'
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && <div className={`stat-change ${changeType}`}>{arrow} {change}</div>}
      </div>
    </div>
  )
}
