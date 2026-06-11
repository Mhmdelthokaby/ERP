"use client"

import { useApp } from "@/lib/app-context"
import type { ReactNode } from "react"

interface ModalProps {
  id: string
  title: string
  width?: string
  children: ReactNode
}

export function Modal({ id, title, width = "w-[480px]", children }: ModalProps) {
  const { activeModal, closeModal } = useApp()
  if (activeModal !== id) return null

  return (
    <div className="fixed inset-0 z-40">
      <div className="modal-overlay absolute inset-0" onClick={() => closeModal()} />
      <div className={`modal-content absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl p-6 ${width} shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-fg">{title}</h3>
          <button onClick={() => closeModal()} className="text-muted hover:text-fg transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
