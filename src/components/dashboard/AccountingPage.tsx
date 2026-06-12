"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { fmt, periods, costCenters } from "@/lib/store"
import { StatusBadge, SourceBadge } from "@/components/shared"
import { ar } from "@/lib/ar"
const a = ar.accounting
const sb = ar.statusBadge

interface CoaNodeType { code: string; name: string; type: string; nb: string; children: CoaNodeType[] }

function CoaNode({ node, depth = 0 }: { node: CoaNodeType; depth?: number }) {
  const hasChildren = node.children && node.children.length > 0
  const typeColors: Record<string, string> = { Asset: "text-info", Liability: "text-success", Equity: "text-accent", Revenue: "text-success", Expense: "text-danger" }
  return (
    <>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-cardHover transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {hasChildren ? <i className="fa-solid fa-caret-down text-muted text-[0.6rem] w-3"></i> : <span className="w-3"></span>}
        <span className="font-mono text-xs text-muted w-12">{node.code}</span>
        <span className="text-fg text-sm">{node.name}</span>
        <span className={`text-[0.6rem] ${typeColors[node.type]} ml-auto uppercase tracking-wider`}>{node.nb}</span>
      </div>
      {hasChildren && node.children.map((child: CoaNodeType) => (
        <CoaNode key={child.code} node={child} depth={depth + 1} />
      ))}
    </>
  )
}

export function AccountingPage() {
  const { data, openModal, reverseEntry } = useApp()
  const [accTab, setAccTab] = useState<"coa" | "journal" | "periods" | "costcenters">("coa")
  const [journalFilter, setJournalFilter] = useState("")

  const filteredJournal = journalFilter ? data.journalEntries.filter((j) => j.source === journalFilter) : data.journalEntries

  return (
    <div>
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 mb-5 inline-flex">
        {(["coa", "journal", "periods", "costcenters"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${accTab === tab ? "active" : "text-muted"}`}
            onClick={() => setAccTab(tab)}
          >
            {tab === "coa" ? a.chartOfAccounts : tab === "journal" ? a.journalEntries : tab === "periods" ? a.fiscalPeriods : a.costCenters}
          </button>
        ))}
      </div>

      {accTab === "coa" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-fg text-sm">{a.chartOfAccounts}</h3>
            <button className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-2" onClick={() => openModal("addAccountModal")}>
              <i className="fa-solid fa-plus text-[0.6rem]"></i> {a.newAccount}
            </button>
          </div>
          <div className="text-sm space-y-1">
            {data.chartOfAccounts.map((n) => (
              <CoaNode key={n.code} node={n} />
            ))}
          </div>
        </div>
      )}

      {accTab === "journal" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <select className="!w-auto text-sm !py-1.5 !px-3" value={journalFilter} onChange={(e) => setJournalFilter(e.target.value)}>
                <option value="">{a.allSources}</option>
                <option value="Manual">{a.manual}</option>
                <option value="TripCompleted">{a.tripCompleted}</option>
                <option value="PaymentReceived">{a.paymentReceived}</option>
                <option value="ExpenseRecorded">{a.expenseRecorded}</option>
                <option value="Reversal">{a.reversal}</option>
              </select>
            </div>
            <button className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-2" onClick={() => openModal("addJournalModal")}>
              <i className="fa-solid fa-plus text-[0.6rem]"></i> {a.manualEntry}
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                <th className="text-left p-4 font-medium">{a.number}</th><th className="text-left p-4 font-medium">{a.date}</th><th className="text-left p-4 font-medium">{a.description}</th><th className="text-left p-4 font-medium">{a.source}</th><th className="text-right p-4 font-medium">{a.debit}</th><th className="text-right p-4 font-medium">{a.credit}</th><th className="text-center p-4 font-medium">{a.status}</th><th className="text-right p-4 font-medium">{a.actions}</th>
              </tr></thead>
              <tbody>
                {filteredJournal.map((je) => (
                  <tr key={je.id} className="data-row border-b border-border/50 cursor-pointer" onClick={() => openModal("journalDetailModal")}>
                    <td className="p-4 font-mono text-accent text-xs">{je.number}</td>
                    <td className="p-4 text-muted text-xs">{je.date}</td>
                    <td className="p-4 text-fg text-xs max-w-[250px] truncate">{je.desc}</td>
                    <td className="p-4"><SourceBadge source={je.source} /></td>
                    <td className="p-4 text-right font-mono text-xs journal-line-debit">{fmt(je.debit)}</td>
                    <td className="p-4 text-right font-mono text-xs journal-line-credit">{fmt(je.credit)}</td>
                    <td className="p-4 text-center">
                      {je.source === "Reversal" ? <span className="text-[0.6rem] text-danger font-medium">{sb.reversal}</span> : <span className="text-[0.6rem] text-success">{sb.posted}</span>}
                    </td>
                    <td className="p-4 text-right">
                      {je.source !== "Reversal" && !je.reversed ? (
                        <button className="text-xs text-danger hover:underline" onClick={(e) => { e.stopPropagation(); reverseEntry(je.id) }}>{a.reverse}</button>
                      ) : <span className="text-xs text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {accTab === "periods" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">{a.period}</th><th className="text-left p-4 font-medium">{a.type}</th><th className="text-left p-4 font-medium">{a.start}</th><th className="text-left p-4 font-medium">{a.end}</th><th className="text-left p-4 font-medium">{a.status}</th><th className="text-right p-4 font-medium">{a.actions}</th>
            </tr></thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.name} className="data-row border-b border-border/50">
                  <td className="p-4 text-fg">{p.name}</td>
                  <td className="p-4"><StatusBadge status={p.type} /></td>
                  <td className="p-4 text-muted text-xs">{p.start}</td>
                  <td className="p-4 text-muted text-xs">{p.end}</td>
                  <td className="p-4">
                    {p.closed ? <span className="status-badge bg-border text-muted">{a.closed}</span> : <span className="status-badge bg-successDim text-success">{a.open}</span>}
                  </td>
                  <td className="p-4 text-right">
                    {!p.closed ? <button className="text-xs text-danger hover:underline">{a.close}</button> : <span className="text-xs text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {accTab === "costcenters" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">{a.name}</th><th className="text-left p-4 font-medium">{a.type}</th><th className="text-left p-4 font-medium">{a.status}</th>
            </tr></thead>
            <tbody>
              {costCenters.map((c) => (
                <tr key={c.name} className="data-row border-b border-border/50">
                  <td className="p-4 text-fg">{c.name}</td>
                  <td className="p-4"><span className="status-badge bg-infoDim text-info">{c.type}</span></td>
                  <td className="p-4"><StatusBadge status="Active" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
