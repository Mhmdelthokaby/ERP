import { db } from "@/db"
import { outboxMessages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { processEvent } from "@/services/journal.service"

export async function pollOutbox() {
  const messages = await db
    .select()
    .from(outboxMessages)
    .where(eq(outboxMessages.status, "Pending"))
    .limit(10)

  for (const message of messages) {
    await processEvent(message.id)
  }
}
