import type { ReactNode } from "react"

interface KpiCardProps {
  label: string
  value: string
  icon: string
  iconBg: string
  children?: ReactNode
}

export function KpiCard({ label, value, icon, iconBg, children }: KpiCardProps) {
  return (
    <div className="kpi-card bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <i className={`fa-solid ${icon} text-xs`}></i>
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-fg">{value}</p>
      {children && <div className="text-xs mt-1">{children}</div>}
    </div>
  )
}
