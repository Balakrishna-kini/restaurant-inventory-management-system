export default function Badge({ type = 'neutral', children }) {
  return <span className={`badge badge-${type}`}><span className="badge-dot" />{children}</span>
}

export function StockBadge({ qty, reorder }) {
  if (qty <= 0) return <Badge type="danger">Out of Stock</Badge>
  if (qty <= reorder) return <Badge type="warning">Low Stock</Badge>
  return <Badge type="success">In Stock</Badge>
}
