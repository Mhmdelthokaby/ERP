import { NextResponse } from "next/server"
import { completeTrip } from "@/services/trip.service"

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await completeTrip(params.id)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to complete trip" }, { status: 500 })
  }
}
