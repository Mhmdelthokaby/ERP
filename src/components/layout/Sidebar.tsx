"use client"

import { useApp } from "@/lib/app-context"
import type { PageName } from "@/lib/store"
import { ar } from "@/lib/ar"

const s = ar.sidebar

const navSections: { label: string; items: { page: PageName; icon: string; label: string; badge?: string }[] }[] = [
  {
    label: s.main,
    items: [
      { page: "dashboard", icon: "fa-solid fa-grid-2", label: s.dashboard },
      { page: "legs", icon: "fa-solid fa-arrows-split-up-and-left", label: s.legs },
      { page: "fleet", icon: "fa-solid fa-truck", label: s.fleet },
      { page: "trips", icon: "fa-solid fa-route", label: s.operations, badge: "12" },
      { page: "expenses", icon: "fa-solid fa-receipt", label: s.expenses },
    ],
  },
  {
    label: s.finance,
    items: [
      { page: "accounting", icon: "fa-solid fa-book", label: s.accounting },
      { page: "arap", icon: "fa-solid fa-file-invoice-dollar", label: s.arAp },
      { page: "reports", icon: "fa-solid fa-chart-pie", label: s.reports },
    ],
  },
  {
    label: s.system,
    items: [
      { page: "suppliers", icon: "fa-solid fa-handshake", label: s.suppliers },
      { page: "maintenance", icon: "fa-solid fa-wrench", label: s.maintenance },
      { page: "settings", icon: "fa-solid fa-gear", label: s.settings },
    ],
  },
]

export function Sidebar() {
  const { currentPage, setPage, sidebarOpen } = useApp()

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} bg-surface border-r border-border flex flex-col flex-shrink-0 z-30 transition-all duration-300`}>
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accentDim flex items-center justify-center">
            <i className="fa-solid fa-truck-fast text-bg text-sm"></i>
          </div>
          <div>
            <h1 className="font-display font-bold text-fg text-lg leading-tight">{s.brand}</h1>
            <p className="text-[0.65rem] text-muted tracking-wider uppercase">{s.brandSub}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-4 py-2">
              <span className="text-[0.65rem] text-muted uppercase tracking-widest font-semibold">{section.label}</span>
            </div>
            {section.items.map((item) => (
              <div
                key={item.page}
                className={`sidebar-item flex items-center gap-3 px-5 py-2.5 cursor-pointer text-sm ${currentPage === item.page ? "active" : ""}`}
                onClick={() => setPage(item.page)}
              >
                <i className={`${item.icon} w-5 text-center text-xs`}></i>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-accent text-bg text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            ME
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg truncate">Mohamed Emad</p>
            <p className="text-[0.7rem] text-accent font-medium">Admin</p>
          </div>
          <button className="text-muted hover:text-danger transition-colors" title={s.signOut}>
            <i className="fa-solid fa-right-from-bracket text-sm"></i>
          </button>
        </div>
      </div>
    </aside>
  )
}
