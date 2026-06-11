"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { fmt } from "@/lib/store"
import { StatusBadge } from "@/components/shared"

export function ArApPage() {
  const { data } = useApp()
  const [arapTab, setArapTab] = useState<"ar-inv" | "ar-pay" | "ap-inv" | "ap-pay">("ar-inv")

  const tabs = [
    { key: "ar-inv" as const, label: "Customer Invoices" },
    { key: "ar-pay" as const, label: "Customer Payments" },
    { key: "ap-inv" as const, label: "Supplier Invoices" },
    { key: "ap-pay" as const, label: "Supplier Payments" },
  ]

  return (
    <div>
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 mb-5 inline-flex">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${arapTab === t.key ? "active" : "text-muted"}`}
            onClick={() => setArapTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {arapTab === "ar-inv" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">Invoice #</th><th className="text-left p-4 font-medium">Customer</th><th className="text-left p-4 font-medium">Date</th><th className="text-left p-4 font-medium">Due Date</th><th className="text-right p-4 font-medium">Total</th><th className="text-right p-4 font-medium">Paid</th><th className="text-left p-4 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {data.arInvoices.map((inv) => (
                <tr key={inv.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-accent text-xs">{inv.number}</td>
                  <td className="p-4 text-fg">{inv.customer}</td>
                  <td className="p-4 text-muted text-xs">{inv.date}</td>
                  <td className="p-4 text-muted text-xs">{inv.due}</td>
                  <td className="p-4 text-right font-mono">EGP {fmt(inv.total)}</td>
                  <td className="p-4 text-right font-mono text-success">EGP {fmt(inv.paid)}</td>
                  <td className="p-4"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {arapTab === "ar-pay" && (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted">
          <i className="fa-solid fa-money-bill-transfer text-2xl mb-2 text-borderLight"></i>
          <p className="text-sm">Customer payment records will appear here</p>
        </div>
      )}

      {arapTab === "ap-inv" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">Invoice #</th><th className="text-left p-4 font-medium">Supplier</th><th className="text-left p-4 font-medium">Date</th><th className="text-right p-4 font-medium">Total</th><th className="text-right p-4 font-medium">Paid</th><th className="text-left p-4 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {data.apInvoices.map((inv) => (
                <tr key={inv.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-accent text-xs">{inv.number}</td>
                  <td className="p-4 text-fg">{inv.supplier}</td>
                  <td className="p-4 text-muted text-xs">{inv.date}</td>
                  <td className="p-4 text-right font-mono">EGP {fmt(inv.total)}</td>
                  <td className="p-4 text-right font-mono text-success">EGP {fmt(inv.paid)}</td>
                  <td className="p-4"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {arapTab === "ap-pay" && (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted">
          <i className="fa-solid fa-money-bill-transfer text-2xl mb-2 text-borderLight"></i>
          <p className="text-sm">Supplier payment records will appear here</p>
        </div>
      )}
    </div>
  )
}
