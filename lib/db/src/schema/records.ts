import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recordsTable = pgTable("records", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull(),
  data: text("data").notNull().default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRecordSchema = createInsertSchema(recordsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof recordsTable.$inferSelect;
