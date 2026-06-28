import './ChartCard.css'

// Lightweight inline bar/line "chart" placeholder built with pure CSS/SVG —
// no external chart library needed, but the markup/data shape matches what a
// real chart lib (recharts etc.) would consume, so swapping later is trivial.
export function BarTrendChart({ data, color = 'var(--primary)' }) {
  const max = Math.max(...data)
  return (
    <div className="bar-trend">
      {data.map((v, i) => (
        <div key={i} className="bar-trend__col">
          <div className="bar-trend__bar" style={{ height: `${(v / max) * 100}%`, background: color }} />
        </div>
      ))}
    </div>
  )
}

export function LineTrendChart({ data, color = 'var(--primary)' }) {
  const max = Math.max(...data)
  const w = 300, h = 100
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (v / max) * (h - 10) - 5
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="line-trend">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={color} opacity="0.08" />
    </svg>
  )
}

export function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  let cumulative = 0
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {segments.map((seg, i) => {
        const fraction = seg.value / total
        const dash = fraction * circumference
        const offset = circumference * (1 - cumulative)
        cumulative += fraction
        return (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )
      })}
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="16" fontWeight="800" fill="var(--text)">{total}</text>
    </svg>
  )
}

export default function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <div>
          <h4>{title}</h4>
          {subtitle && <span>{subtitle}</span>}
        </div>
        {action}
      </div>
      <div className="chart-card__body">{children}</div>
    </div>
  )
}
