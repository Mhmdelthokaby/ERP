"use client"

import { useApp } from "@/lib/app-context"
import { pageTitles } from "@/lib/store"
import { ar } from "@/lib/ar"

export function Header() {
  const { currentPage, currentSubtitle, toggleSidebar } = useApp()
  const [title, breadcrumb] = pageTitles[currentPage]

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-fg hover:border-borderLight transition-all">
          <i className="fa-solid fa-bars text-sm"></i>
        </button>
        <h2 className="font-display font-semibold text-fg text-base">{title}</h2>
        <span className="text-xs text-muted">{currentSubtitle || breadcrumb}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder={ar.header.search}
            className="w-56 pl-9 py-1.5 text-sm !bg-card !border-border"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs"></i>
        </div>
        <button className="relative w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-fg hover:border-borderLight transition-all">
          <i className="fa-solid fa-bell text-sm"></i>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[0.6rem] text-white flex items-center justify-center font-bold">
            3
          </span>
        </button>
        <div className="w-px h-6 bg-border"></div>
        <div className="text-xs text-muted" id="currentDate">
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "short", month: "short", day: "numeric", year: "numeric",
          })}
        </div>
      </div>
    </header>
  )
}
