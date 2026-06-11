import { db } from "@/db"
import { journalEntries, journalEntryLines, outboxMessages } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

export async function processEvent(messageId: string) {
  const [message] = await db
    .select()
    .from(outboxMessages)
    .where(eq(outboxMessages.id, messageId))

  if (!message || message.status !== "Pending") return

  try {
    await db.transaction(async (tx) => {
      if (message.eventType === "TripCompleted") {
        const { tripId } = message.payload as { tripId: string }
        const entryNumber = `JE-${Date.now()}`
        const [entry] = await tx
          .insert(journalEntries)
          .values({
            entryNumber,
            description: `Trip completed: ${tripId}`,
            entryDate: new Date().toISOString().split("T")[0],
            status: "Posted",
          })
          .returning()

        await tx.insert(journalEntryLines).values({
          journalEntryId: entry.id,
          accountId: "00000000-0000-0000-0000-000000000001",
          creditAmount: "0",
          debitAmount: "0",
          baseAmount: "0",
          description: "Revenue from trip",
        })
      }

      await tx
        .update(outboxMessages)
        .set({ status: "Processed", processedAt: new Date() })
        .where(eq(outboxMessages.id, messageId))
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    await db
      .update(outboxMessages)
      .set({
        status: "Failed",
        retryCount: sql`retry_count + 1`,
        errorMessage: message,
      })
      .where(eq(outboxMessages.id, messageId))
  }
}
