"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await fetch("/api/operations/orders")
      if (!res.ok) throw new Error("Failed to fetch trips")
      return res.json()
    },
  })
}

export function useCompleteTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch(`/api/operations/orders/${tripId}/complete`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to complete trip")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] })
    },
  })
}
