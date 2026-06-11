"use client"

import { AppProvider, useApp } from "@/lib/app-context"
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
  const { currentPage } = useApp()

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
          {pageComponents[currentPage] || <DashboardHome />}
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
