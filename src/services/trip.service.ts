import { db } from "@/db"
import { operationOrders, outboxMessages } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function completeTrip(tripId: string) {
  return await db.transaction(async (tx) => {
    const [order] = await tx
      .update(operationOrders)
      .set({ status: "Completed", updatedAt: new Date() })
      .where(eq(operationOrders.id, tripId))
      .returning()

    await tx.insert(outboxMessages).values({
      eventType: "TripCompleted",
      payload: { tripId, orderNumber: order.orderNumber },
    })

    return order
  })
}
