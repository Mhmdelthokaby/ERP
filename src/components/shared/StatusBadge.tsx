import { ar } from "@/lib/ar"
const a = ar.statusBadge

const statusColors: Record<string, string> = {
  Active: "bg-successDim text-success",
  Inactive: "bg-dangerDim text-danger",
  Maintenance: "bg-warningDim text-warning",
  Pending: "bg-infoDim text-info",
  InProgress: "bg-warningDim text-warning",
  Completed: "bg-successDim text-success",
  Cancelled: "bg-dangerDim text-danger",
  Draft: "bg-border text-muted",
  Posted: "bg-infoDim text-info",
  PartiallyPaid: "bg-warningDim text-warning",
  Paid: "bg-successDim text-success",
  Processed: "bg-successDim text-success",
  Failed: "bg-dangerDim text-danger",
  Employee: "bg-infoDim text-info",
  Contractor: "bg-accentGlow text-accent",
}

const statusLabels: Record<string, string> = {
  Active: a.active,
  Inactive: a.inactive,
  Maintenance: a.maintenance,
  Pending: a.pending,
  InProgress: a.inProgress,
  Completed: a.completed,
  Cancelled: a.cancelled,
  Draft: a.draft,
  Posted: a.posted,
  PartiallyPaid: a.partiallyPaid,
  Paid: a.paid,
  Processed: a.processed,
  Failed: a.failed,
  Employee: a.employee,
  Contractor: a.contractor,
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge ${statusColors[status] || "bg-border text-muted"}`}>
      {statusLabels[status] || status}
    </span>
  )
}

const roleColors: Record<string, string> = {
  Admin: "bg-accentGlow text-accent",
  Accountant: "bg-infoDim text-info",
  Operator: "bg-successDim text-success",
  Viewer: "bg-border text-muted",
}

const roleLabels: Record<string, string> = {
  Admin: a.admin,
  Accountant: a.accountant,
  Operator: a.operator,
  Viewer: a.viewer,
}

export function RoleBadge({ role }: { role: string }) {
  return <span className={`status-badge ${roleColors[role]}`}>{roleLabels[role] || role}</span>
}

const sourceColors: Record<string, string> = {
  Manual: "bg-accentGlow text-accent",
  TripCompleted: "bg-successDim text-success",
  PaymentReceived: "bg-infoDim text-info",
  ExpenseRecorded: "bg-warningDim text-warning",
  Reversal: "bg-dangerDim text-danger",
}

const sourceLabels: Record<string, string> = {
  Manual: a.manual,
  TripCompleted: a.tripCompleted,
  PaymentReceived: a.paymentReceived,
  ExpenseRecorded: a.expenseRecorded,
  Reversal: a.reversal,
}

export function SourceBadge({ source }: { source: string }) {
  return <span className={`status-badge ${sourceColors[source] || "bg-border text-muted"}`}>{sourceLabels[source] || source}</span>
}
