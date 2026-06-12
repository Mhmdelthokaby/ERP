"use client"

import { useApp } from "@/lib/app-context"
import { ar } from "@/lib/ar"
const d = ar.dashboard
import { fmt } from "@/lib/store"
import { KpiCard, StatusBadge } from "@/components/shared"
import { useEffect, useRef } from "react"

const chartData = [
  { month: "Jan", rev: 620000, exp: 240000 },
  { month: "Feb", rev: 710000, exp: 280000 },
  { month: "Mar", rev: 847500, exp: 312800 },
  { month: "Apr", rev: 0, exp: 0 },
  { month: "May", rev: 0, exp: 0 },
  { month: "Jun", rev: 0, exp: 0 },
]

export function DashboardHome() {
  const { data } = useApp()
  const recentTrips = data.trips.slice(0, 5)
  const unpaidInvoices = data.arInvoices.filter((i) => i.status !== "Paid")
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chartRef.current) {
      const bars = chartRef.current.querySelectorAll(".chart-bar")
      bars.forEach((bar) => {
        const el = bar as HTMLElement
        const h = el.style.height
        el.style.height = "0%"
        requestAnimationFrame(() => { el.style.height = h })
      })
    }
  }, [])

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label={d.revenue} value={`EGP ${fmt(data.trips.reduce((s, t) => s + t.priceBase, 0))}`} icon="fa-arrow-trend-up" iconBg="bg-successDim">
          <span className="text-success"><i className="fa-solid fa-caret-up mr-1"></i>12.5% {d.vsLastMonth}</span>
        </KpiCard>
        <KpiCard label={d.activeTrips} value={`${data.trips.filter((t) => t.status === "InProgress" || t.status === "Pending").length}`} icon="fa-route" iconBg="bg-infoDim">
          <span className="text-muted">{data.trips.filter((t) => t.status === "InProgress").length} {d.inProgress} · {data.trips.filter((t) => t.status === "Pending").length} {d.pending}</span>
        </KpiCard>
        <KpiCard label={d.expenses} value={`EGP ${fmt(data.vehicleExpenses.reduce((s, e) => s + e.amount, 0))}`} icon="fa-arrow-trend-down" iconBg="bg-dangerDim">
          <span className="text-danger"><i className="fa-solid fa-caret-up mr-1"></i>8.2% {d.vsLastMonth}</span>
        </KpiCard>
        <KpiCard label={d.netProfit} value={`EGP ${fmt(data.trips.reduce((s, t) => s + t.priceBase, 0) - data.vehicleExpenses.reduce((s, e) => s + e.amount, 0))}`} icon="fa-coins" iconBg="bg-accentGlow">
          <span className="text-success">63.1% {d.margin}</span>
        </KpiCard>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-fg text-sm">{d.revenueVsExpenses}</h3>
          </div>
          <div ref={chartRef} className="flex items-end gap-2 h-44" id="revenueChart">
            {chartData.map((cd) => {
              const maxVal = 900000
              const revH = Math.max((cd.rev / maxVal) * 100, 2)
              const expH = Math.max((cd.exp / maxVal) * 100, 2)
              const profitH = Math.max(((cd.rev - cd.exp) / maxVal) * 100, 0)
              return (
                <div key={cd.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-[3px] h-40">
                    <div className="w-3 bg-accent rounded-t-sm chart-bar" style={{ height: `${revH}%` }} title={`${d.revenueChart}: ${fmt(cd.rev)}`}></div>
                    <div className="w-3 bg-danger rounded-t-sm chart-bar" style={{ height: `${expH}%` }} title={`${d.expensesChart}: ${fmt(cd.exp)}`}></div>
                    {profitH > 0 && <div className="w-3 bg-success rounded-t-sm chart-bar" style={{ height: `${profitH}%` }} title={`${d.profitChart}: ${fmt(cd.rev - cd.exp)}`}></div>}
                  </div>
                  <span className="text-[0.65rem] text-muted">{cd.month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-6 mt-3 justify-center">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-accent"></span><span className="text-xs text-muted">{d.revenueChart}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-danger"></span><span className="text-xs text-muted">{d.expensesChart}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-success"></span><span className="text-xs text-muted">{d.profitChart}</span></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold text-fg text-sm mb-4">{d.fleetStatus}</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted">{d.active}</span><span className="text-success font-semibold">{data.vehicles.filter((v) => v.status === "Active").length}</span></div>
              <div className="h-2 bg-bg rounded-full overflow-hidden"><div className="h-full bg-success rounded-full" style={{ width: `${(data.vehicles.filter((v) => v.status === "Active").length / data.vehicles.length) * 100}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted">{d.maintenance}</span><span className="text-warning font-semibold">{data.vehicles.filter((v) => v.status === "Maintenance").length}</span></div>
              <div className="h-2 bg-bg rounded-full overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width: `${(data.vehicles.filter((v) => v.status === "Maintenance").length / data.vehicles.length) * 100}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted">{d.inactive}</span><span className="text-muted font-semibold">{data.vehicles.filter((v) => v.status === "Inactive").length}</span></div>
              <div className="h-2 bg-bg rounded-full overflow-hidden"><div className="h-full bg-muted/50 rounded-full" style={{ width: `${(data.vehicles.filter((v) => v.status === "Inactive").length / data.vehicles.length) * 100}%` }}></div></div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border">
            <h4 className="text-xs text-muted mb-3 font-medium">{d.driversAvailable}</h4>
            <div className="flex -space-x-2">
              {data.drivers.filter((d) => d.isActive).slice(0, 4).map((d, i) => {
                const initials = d.fullName.split(" ").map((n) => n[0]).join("")
                const colors = ["bg-info/20 text-info", "bg-success/20 text-success", "bg-accent/20 text-accent", "bg-danger/20 text-danger"]
                return (
                  <div key={d.id} className={`w-8 h-8 rounded-full ${colors[i]} border-2 border-card flex items-center justify-center text-xs font-bold`}>
                    {initials}
                  </div>
                )
              })}
              {data.drivers.filter((d) => d.isActive).length > 4 && (
                <div className="w-8 h-8 rounded-full bg-border border-2 border-card flex items-center justify-center text-muted text-xs font-bold">
                  +{data.drivers.filter((d) => d.isActive).length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-fg text-sm">{d.recentTrips}</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border">
              <th className="text-left pb-3 font-medium">{d.route}</th><th className="text-left pb-3 font-medium">{d.customer}</th><th className="text-left pb-3 font-medium">{d.amount}</th><th className="text-left pb-3 font-medium">{d.status}</th>
            </tr></thead>
            <tbody>
              {recentTrips.map((t) => (
                <tr key={t.id} className="data-row border-b border-border/30">
                  <td className="py-2.5 text-fg text-xs">{t.from} → {t.to}</td>
                  <td className="py-2.5 text-muted text-xs">{t.customer}</td>
                  <td className="py-2.5 font-mono text-xs">EGP {fmt(t.priceBase)}</td>
                  <td className="py-2.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-fg text-sm">{d.outstandingInvoices}</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border">
              <th className="text-left pb-3 font-medium">{d.invoice}</th><th className="text-left pb-3 font-medium">{d.customer}</th><th className="text-left pb-3 font-medium">{d.due}</th><th className="text-right pb-3 font-medium">{d.balance}</th>
            </tr></thead>
            <tbody>
              {unpaidInvoices.map((inv) => {
                const balance = inv.total - inv.paid
                return (
                  <tr key={inv.id} className="data-row border-b border-border/30">
                    <td className="py-2.5 font-mono text-accent text-xs">{inv.number}</td>
                    <td className="py-2.5 text-muted text-xs">{inv.customer}</td>
                    <td className="py-2.5 text-muted text-xs">{inv.due}</td>
                    <td className="py-2.5 text-right font-mono text-xs text-danger">EGP {fmt(balance)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
