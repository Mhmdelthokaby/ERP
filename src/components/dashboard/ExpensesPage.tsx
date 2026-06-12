"use client"

import { ar } from "@/lib/ar"
import { useState, useRef, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { fmt } from "@/lib/store"
import { StatusBadge } from "@/components/shared"

const e = ar.expenses

const expenseData = [
  { label: "Fuel", value: 142300, color: "#E8A838" },
  { label: "Maintenance", value: 68500, color: "#EF5350" },
  { label: "Driver Wages", value: 52000, color: "#60A5FA" },
  { label: "Tolls", value: 28400, color: "#2DD4A8" },
  { label: "Other", value: 21600, color: "#8B90A0" },
]
const totalExpense = expenseData.reduce((s, d) => s + d.value, 0)

const trendData = [
  { month: "Jan", amount: 240000 },
  { month: "Feb", amount: 280000 },
  { month: "Mar", amount: 312800 },
]
const maxTrend = 350000

export function ExpensesPage() {
  const { data, openModal } = useApp()
  const [expTab, setExpTab] = useState<"vehicle-exp" | "trip-exp" | "currencies">("vehicle-exp")
  const pieCanvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!pieCanvas.current) return
    const ctx = pieCanvas.current.getContext("2d")
    if (!ctx) return
    let startAngle = -Math.PI / 2
    const cx = 90, cy = 90, r = 70, innerR = 45
    ctx.clearRect(0, 0, 180, 180)
    expenseData.forEach((d) => {
      const sliceAngle = (d.value / totalExpense) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle)
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = d.color
      ctx.fill()
      startAngle += sliceAngle
    })
    ctx.fillStyle = "#E8EAF0"
    ctx.font = 'bold 14px "DM Sans"'
    ctx.textAlign = "center"
    ctx.fillText("EGP", cx, cy - 4)
    ctx.font = '10px "DM Sans"'
    ctx.fillStyle = "#8B90A0"
    ctx.fillText(fmt(totalExpense), cx, cy + 12)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          {(["vehicle-exp", "trip-exp", "currencies"] as const).map((tab) => (
            <button
              key={tab}
              className={`tab-btn text-sm px-4 py-1.5 rounded-md ${expTab === tab ? "active" : "text-muted"}`}
              onClick={() => setExpTab(tab)}
            >
              {tab === "vehicle-exp" ? e.vehicleExpenses : tab === "trip-exp" ? e.tripExpenses : e.currencies}
            </button>
          ))}
        </div>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2" onClick={() => openModal("addExpenseModal")}>
          <i className="fa-solid fa-plus text-xs"></i> {e.recordExpense}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h4 className="text-xs text-muted font-medium mb-3 uppercase tracking-wider">{e.expenseBreakdown}</h4>
          <div className="flex items-center justify-center">
            <canvas ref={pieCanvas} width="180" height="180"></canvas>
          </div>
        </div>
        <div className="col-span-2 bg-card border border-border rounded-xl p-5">
          <h4 className="text-xs text-muted font-medium mb-3 uppercase tracking-wider">{e.monthlyTrend}</h4>
          <div className="flex items-end gap-3 h-36">
            {trendData.map((d) => {
              const h = Math.max((d.amount / maxTrend) * 100, 2)
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-32">
                    <div
                      className="w-full max-w-[60px] rounded-t-lg chart-bar"
                      style={{ height: `${h}%`, background: "linear-gradient(180deg,#EF5350,#B71C1C)" }}
                      title={fmt(d.amount)}
                    ></div>
                  </div>
                  <span className="text-[0.65rem] text-muted">{d.month}</span>
                  <span className="text-[0.6rem] text-fg font-mono">{(d.amount / 1000).toFixed(0)}K</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {expTab === "vehicle-exp" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">{e.vehicle}</th><th className="text-left p-4 font-medium">{e.type}</th><th className="text-left p-4 font-medium">{e.date}</th><th className="text-right p-4 font-medium">{e.amount}</th><th className="text-left p-4 font-medium">{e.payment}</th><th className="text-left p-4 font-medium">{e.notes}</th>
            </tr></thead>
            <tbody>
              {data.vehicleExpenses.map((e) => (
                <tr key={e.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-accent text-xs">{e.vehicle}</td>
                  <td className="p-4 text-fg">{e.type}</td>
                  <td className="p-4 text-muted text-xs">{e.date}</td>
                  <td className="p-4 text-right font-mono">EGP {fmt(e.amount)}</td>
                  <td className="p-4"><StatusBadge status={e.method} /></td>
                  <td className="p-4 text-muted text-xs max-w-[200px] truncate">{e.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expTab === "trip-exp" && (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted">
          <i className="fa-solid fa-filter text-2xl mb-2 text-borderLight"></i>
          <p className="text-sm">{e.selectTrip}</p>
        </div>
      )}

      {expTab === "currencies" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">{e.code}</th><th className="text-left p-4 font-medium">{e.name}</th><th className="text-left p-4 font-medium">{e.rate}</th><th className="text-left p-4 font-medium">{e.baseCurrency}</th>
            </tr></thead>
            <tbody>
              {data.currencies.map((c) => (
                <tr key={c.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono font-semibold text-accent">{c.code}</td>
                  <td className="p-4 text-fg">{c.name}</td>
                  <td className="p-4 font-mono">{c.rate.toFixed(c.isBase ? 0 : 2)}</td>
                  <td className="p-4">{c.isBase ? <span className="status-badge bg-successDim text-success">{e.baseCurrency}</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
