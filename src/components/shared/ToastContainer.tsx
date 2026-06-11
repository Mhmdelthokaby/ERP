"use client"

import { useApp } from "@/lib/app-context"

const icons: Record<string, string> = {
  success: "fa-check-circle text-success",
  error: "fa-circle-xmark text-danger",
  info: "fa-circle-info text-info",
  warning: "fa-triangle-exclamation text-warning",
}

const borders: Record<string, string> = {
  success: "border-success bg-successDim",
  error: "border-danger bg-dangerDim",
  info: "border-info bg-infoDim",
  warning: "border-warning bg-warningDim",
}

export function ToastContainer() {
  const { toasts, removeToast } = useApp()

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${borders[t.type]} text-sm text-fg shadow-xl cursor-pointer`}
          onClick={() => removeToast(t.id)}
        >
          <i className={`fa-solid ${icons[t.type]}`}></i>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
