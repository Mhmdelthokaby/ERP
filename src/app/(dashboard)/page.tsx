"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppProvider, useApp } from "@/lib/app-context"
import { authClient } from "@/lib/auth/client"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { ToastContainer } from "@/components/shared"
import { DashboardHome } from "@/components/dashboard/DashboardHome"
import { FleetPage } from "@/components/dashboard/FleetPage"
import { TripsPage } from "@/components/dashboard/TripsPage"
import { ExpensesPage } from "@/components/dashboard/ExpensesPage"
import { AccountingPage } from "@/components/dashboard/AccountingPage"
import { ArApPage } from "@/components/dashboard/ArApPage"
import { ReportsPage } from "@/components/dashboard/ReportsPage"
import { SettingsPage } from "@/components/dashboard/SettingsPage"
import {
  AddVehicleModal,
  AddTripModal,
  AddExpenseModal,
  AddJournalModal,
  AddAccountModal,
  AddUserModal,
} from "@/components/modals/ModalForms"

function DashboardInner() {
  const { currentPage, loading } = useApp()
  const router = useRouter()
  const session = authClient.useSession()

  useEffect(() => {
    if (!session.isPending && !session.data) {
      router.push("/login")
    }
  }, [session, router])

  if (session.isPending || !session.data) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  const pageComponents: Record<string, JSX.Element> = {
    dashboard: <DashboardHome />,
    fleet: <FleetPage />,
    trips: <TripsPage />,
    expenses: <ExpensesPage />,
    accounting: <AccountingPage />,
    arap: <ArApPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage />,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            pageComponents[currentPage] || <DashboardHome />
          )}
        </div>
      </main>
      <AddVehicleModal />
      <AddTripModal />
      <AddExpenseModal />
      <AddJournalModal />
      <AddAccountModal />
      <AddUserModal />
      <ToastContainer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardInner />
    </AppProvider>
  )
}
