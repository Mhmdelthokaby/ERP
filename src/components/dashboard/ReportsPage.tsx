"use client"

import { fmt } from "@/lib/store"
import { ar } from "@/lib/ar"

const r = ar.reports

const accounts = [
  { code: "1100", name: "Cash on Hand", debit: 92500, credit: 6000 },
  { code: "1101", name: "Cash at Bank", debit: 370000, credit: 0 },
  { code: "1200", name: "Accounts Receivable", debit: 175000, credit: 50000 },
  { code: "2100", name: "Accounts Payable", debit: 6000, credit: 29600 },
  { code: "3100", name: "Owner's Capital", debit: 0, credit: 0 },
  { code: "4100", name: "Transportation Revenue", debit: 0, credit: 183000 },
  { code: "5100", name: "Fuel Expense", debit: 3500, credit: 0 },
  { code: "5200", name: "Maintenance Expense", debit: 12500, credit: 0 },
  { code: "5800", name: "Administrative Expense", debit: 2500, credit: 2500 },
]

export function ReportsPage() {
  return (
    <div>
      <div className="flex gap-2 mb-5">
        <select className="!w-auto text-sm !py-1.5 !px-3">
          <option value="q1">Q1 2024 (Jan - Mar)</option>
          <option value="q2">Q2 2024 (Apr - Jun)</option>
          <option value="q3">Q3 2024 (Jul - Sep)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-scale-balanced text-accent text-xs"></i>
            <h3 className="font-display font-semibold text-fg text-sm">{r.trialBalance}</h3>
            <span className="ml-auto text-[0.65rem] text-success font-medium bg-successDim px-2 py-0.5 rounded-full">{r.balanced}</span>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-muted uppercase tracking-wider border-b border-border">
              <th className="text-left pb-2 font-medium">{r.account}</th><th className="text-right pb-2 font-medium">{r.debit}</th><th className="text-right pb-2 font-medium">{r.credit}</th><th className="text-right pb-2 font-medium">{r.balance}</th>
            </tr></thead>
            <tbody>
              {accounts.map((a) => {
                const balance = a.debit - a.credit
                return (
                  <tr key={a.code} className="border-b border-border/30">
                    <td className="py-1.5">
                      <span className="font-mono text-muted mr-2">{a.code}</span>{a.name}
                    </td>
                    <td className={`text-right py-1.5 font-mono ${a.debit ? "journal-line-debit" : "text-muted"}`}>
                      {a.debit ? fmt(a.debit) : "—"}
                    </td>
                    <td className={`text-right py-1.5 font-mono ${a.credit ? "journal-line-credit" : "text-muted"}`}>
                      {a.credit ? fmt(a.credit) : "—"}
                    </td>
                    <td className={`text-right py-1.5 font-mono ${balance > 0 ? "journal-line-debit" : balance < 0 ? "journal-line-credit" : "text-muted"}`}>
                      {balance !== 0 ? fmt(Math.abs(balance)) : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot><tr className="border-t border-border font-bold text-fg">
              <td className="pt-2">{r.total}</td>
              <td className="text-right pt-2">1,250,000.00</td>
              <td className="text-right pt-2">1,250,000.00</td>
              <td className="text-right pt-2">0.00</td>
            </tr></tfoot>
          </table>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-chart-line text-accent text-xs"></i>
            <h3 className="font-display font-semibold text-fg text-sm">{r.incomeStatement}</h3>
          </div>
          <div className="space-y-2">
            {[
              ["Transportation Revenue", "847,500.00", "text-success"],
              ["Tourism Revenue", "125,000.00", "text-success"],
              ["Other Revenue", "8,200.00", "text-success"],
            ].map(([label, amount, color]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted">{label}</span><span className={`${color} font-medium`}>{amount}</span>
              </div>
            ))}
            <div className="border-t border-border my-2"></div>
            <div className="flex justify-between text-sm font-semibold text-fg">
              <span>{r.totalRevenue}</span><span>980,700.00</span>
            </div>
            <div className="border-t border-border my-2"></div>
            {[
              ["Fuel Expense", "142,300.00", "text-danger"],
              ["Maintenance Expense", "68,500.00", "text-danger"],
              ["Driver Wages", "52,000.00", "text-danger"],
              ["Tolls & Permits", "28,400.00", "text-danger"],
              ["Other Expenses", "21,600.00", "text-danger"],
            ].map(([label, amount]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted">{label}</span><span className="text-danger">{amount}</span>
              </div>
            ))}
            <div className="border-t border-border my-2"></div>
            <div className="flex justify-between text-sm font-semibold text-fg">
              <span>{r.totalExpenses}</span><span>312,800.00</span>
            </div>
            <div className="border-t-2 border-accent my-2"></div>
            <div className="flex justify-between text-base font-bold">
              <span className="text-accent">{r.netProfit}</span><span className="text-success">667,900.00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <i className="fa-solid fa-building-columns text-accent text-xs"></i>
          <h3 className="font-display font-semibold text-fg text-sm">{r.balanceSheet} (as of Mar 31, 2024)</h3>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">{r.assets}</h4>
            <div className="space-y-1.5 text-xs">
              {[
                ["Cash on Hand", "85,000.00"],
                ["Cash at Bank", "320,000.00"],
                ["Accounts Receivable", "245,000.00"],
                ["Prepaid Expenses", "15,000.00"],
                ["Vehicles (net)", "1,800,000.00"],
              ].map(([label, amount]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted">{label}</span><span>{amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-fg border-t border-border pt-2">
                <span>{r.totalAssets}</span><span>2,465,000.00</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">{r.liabilitiesAndEquity}</h4>
            <div className="space-y-1.5 text-xs">
              {[
                ["Accounts Payable", "92,000.00"],
                ["Accrued Expenses", "35,000.00"],
              ].map(([label, amount]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted">{label}</span><span>{amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-fg border-t border-border pt-2">
                <span>{r.totalLiabilities}</span><span>127,000.00</span>
              </div>
              <div className="mt-3"></div>
              {[
                ["Owner's Capital", "1,500,000.00"],
                ["Retained Earnings", "838,000.00"],
              ].map(([label, amount]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted">{label}</span><span>{amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-fg border-t border-border pt-2">
                <span>{r.totalEquity}</span><span>2,338,000.00</span>
              </div>
              <div className="flex justify-between font-bold text-accent border-t-2 border-accent pt-2">
                <span>{r.totalLE}</span><span>2,465,000.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
