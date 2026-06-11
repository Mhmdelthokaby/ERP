"use client"

import { useQuery } from "@tanstack/react-query"

export function useJournalEntries() {
  return useQuery({
    queryKey: ["journal-entries"],
    queryFn: async () => {
      const res = await fetch("/api/accounting/journal-entries")
      if (!res.ok) throw new Error("Failed to fetch journal entries")
      return res.json()
    },
  })
}
