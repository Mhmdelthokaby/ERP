"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { RoleBadge, StatusBadge } from "@/components/shared"
import { ar } from "@/lib/ar"

export function SettingsPage() {
  const { data, openModal } = useApp()
  const [settTab, setSettTab] = useState<"users" | "outbox" | "audit">("users")
  const s = ar.settings
  const b = ar.statusBadge

  return (
    <div>
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 mb-5 inline-flex">
        {(["users", "outbox", "audit"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn text-sm px-4 py-1.5 rounded-md ${settTab === tab ? "active" : "text-muted"}`}
            onClick={() => setSettTab(tab)}
          >
            {tab === "users" ? s.users : tab === "outbox" ? s.outbox : s.auditLog}
          </button>
        ))}
      </div>

      {settTab === "users" && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-2" onClick={() => openModal("addUserModal")}>
              <i className="fa-solid fa-user-plus text-[0.6rem]"></i> {s.createUser}
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
                <th className="text-left p-4 font-medium">{s.code}</th><th className="text-left p-4 font-medium">{s.name}</th><th className="text-left p-4 font-medium">{s.email}</th><th className="text-left p-4 font-medium">{s.role}</th><th className="text-left p-4 font-medium">{s.lastLogin}</th><th className="text-left p-4 font-medium">{s.status}</th><th className="text-right p-4 font-medium">{s.action}</th>
              </tr></thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="data-row border-b border-border/50">
                    <td className="p-4 font-mono text-muted text-xs">{u.code}</td>
                    <td className="p-4 text-fg font-medium">{u.name}</td>
                    <td className="p-4 text-muted text-xs">{u.email}</td>
                    <td className="p-4"><RoleBadge role={u.role} /></td>
                    <td className="p-4 text-muted text-xs">{u.lastLogin || s.never}</td>
                    <td className="p-4">{u.isActive ? <StatusBadge status={b.active} /> : <StatusBadge status={b.inactive} />}</td>
                    <td className="p-4 text-right">
                      <button className="text-muted hover:text-accent transition-colors mr-2" title={s.changeRole}><i className="fa-solid fa-user-pen text-xs"></i></button>
                      {u.isActive && <button className="text-muted hover:text-danger transition-colors" title={s.deactivate}><i className="fa-solid fa-ban text-xs"></i></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {settTab === "outbox" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">{s.id}</th><th className="text-left p-4 font-medium">{s.eventType}</th><th className="text-left p-4 font-medium">{s.status}</th><th className="text-left p-4 font-medium">{s.retries}</th><th className="text-left p-4 font-medium">{s.occurred}</th><th className="text-left p-4 font-medium">{s.error}</th>
            </tr></thead>
            <tbody>
              {data.outboxMessages.map((m) => (
                <tr key={m.id} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-muted text-xs">#{m.id}</td>
                  <td className="p-4 text-fg text-xs">{m.event}</td>
                  <td className="p-4"><StatusBadge status={m.status} /></td>
                  <td className="p-4 text-muted text-xs">{m.retries}/3</td>
                  <td className="p-4 text-muted text-xs">{m.occurred}</td>
                  <td className="p-4 text-danger text-xs max-w-[200px] truncate">{m.error || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {settTab === "audit" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted uppercase tracking-wider border-b border-border bg-surface/50">
              <th className="text-left p-4 font-medium">{s.timestamp}</th><th className="text-left p-4 font-medium">{s.user}</th><th className="text-left p-4 font-medium">{s.table}</th><th className="text-left p-4 font-medium">{s.action}</th><th className="text-left p-4 font-medium">{s.details}</th>
            </tr></thead>
            <tbody>
              {data.auditLogs.map((l, i) => (
                <tr key={i} className="data-row border-b border-border/50">
                  <td className="p-4 font-mono text-muted text-xs">{l.ts}</td>
                  <td className="p-4 text-fg text-xs">{l.user}</td>
                  <td className="p-4 font-mono text-xs text-accent">{l.table}</td>
                  <td className="p-4">
                    <span className={`status-badge ${l.action === "Insert" ? "bg-successDim text-success" : l.action === "Update" ? "bg-infoDim text-info" : "bg-dangerDim text-danger"}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="p-4 text-muted text-xs max-w-[300px] truncate">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
