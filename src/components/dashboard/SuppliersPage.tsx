"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Supplier } from "@/lib/store"
import { ar } from "@/lib/ar"

const s = ar.suppliers

const columns: { key: keyof Supplier; label: string; render?: (val: unknown) => string }[] = [
  { key: "code", label: s.code, render: (v) => String(v) },
  { key: "name", label: s.name },
  { key: "taxNumber", label: s.taxNumber },
  { key: "phone", label: s.phone },
  { key: "notes", label: s.notes },
]

export function SuppliersPage() {
  const { data, activeModal, openModal, editingSupplier, setEditingSupplier, addSupplier, updateSupplier, deleteSupplier } = useApp()
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    openModal("edit-supplier")
  }

  const handleDelete = (supplier: Supplier) => {
    if (confirm(`${s.deleteConfirm} "${supplier.name}"؟`)) {
      deleteSupplier(supplier.id)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-fg">{s.title}</h2>
          <p className="text-sm text-muted">{s.subtitle}</p>
        </div>
        <button className="btn btn-primary text-sm p-3 rounded-xl text-white" onClick={() => { setEditingSupplier(null); openModal("add-supplier") }}>
          <i className="fa-solid fa-plus ml-1.5"></i>
          {s.add}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 bg-surface rounded-xl border border-border overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
                {columns.map((col) => (
                  <th key={col.key} className="text-right px-4 py-3 font-semibold">{col.label}</th>
                ))}
                <th className="text-right px-4 py-3 font-semibold w-24"></th>
              </tr>
            </thead>
            <tbody>
              {data.suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className={`border-b border-border cursor-pointer transition-colors hover:bg-accent/5 ${selectedSupplier?.id === supplier.id ? "bg-accent/10" : ""}`}
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-fg">
                      {col.render ? col.render(supplier[col.key]) : String(supplier[col.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-accent hover:text-accentDim transition-colors text-xs" onClick={(e) => { e.stopPropagation(); handleEdit(supplier) }}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="text-danger hover:text-danger/80 transition-colors text-xs" onClick={(e) => { e.stopPropagation(); handleDelete(supplier) }}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.suppliers.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="text-center text-muted py-8">{s.noSelection}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedSupplier && (
          <div className="w-80 bg-surface rounded-xl border border-border p-5 flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-fg text-base">{selectedSupplier.name}</h3>
              <button className="text-muted hover:text-fg transition-colors text-lg leading-none" onClick={() => setSelectedSupplier(null)}>&times;</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: s.code, value: String(selectedSupplier.code) },
                { label: s.name, value: selectedSupplier.name },
                { label: s.taxNumber, value: selectedSupplier.taxNumber },
                { label: s.phone, value: selectedSupplier.phone },
                { label: s.notes, value: selectedSupplier.notes },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center gap-2 pb-2 border-b border-border last:border-b-0">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-fg font-medium">{item.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
