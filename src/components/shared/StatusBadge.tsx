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

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge ${statusColors[status] || "bg-border text-muted"}`}>
      {status}
    </span>
  )
}

const roleColors: Record<string, string> = {
  Admin: "bg-accentGlow text-accent",
  Accountant: "bg-infoDim text-info",
  Operator: "bg-successDim text-success",
  Viewer: "bg-border text-muted",
}

export function RoleBadge({ role }: { role: string }) {
  return <span className={`status-badge ${roleColors[role]}`}>{role}</span>
}

const sourceColors: Record<string, string> = {
  Manual: "bg-accentGlow text-accent",
  TripCompleted: "bg-successDim text-success",
  PaymentReceived: "bg-infoDim text-info",
  ExpenseRecorded: "bg-warningDim text-warning",
  Reversal: "bg-dangerDim text-danger",
}

export function SourceBadge({ source }: { source: string }) {
  return <span className={`status-badge ${sourceColors[source] || "bg-border text-muted"}`}>{source}</span>
}
