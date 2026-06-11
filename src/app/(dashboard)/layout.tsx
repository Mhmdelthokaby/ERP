import Link from "next/link"

const navItems = [
  { label: "Fleet", href: "/fleet/vehicles" },
  { label: "Operations", href: "/operations/orders" },
  { label: "Expenses", href: "/expenses" },
  { label: "Accounting", href: "/accounting/journal" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4">
        <h2 className="mb-6 text-lg font-semibold">ERP</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
