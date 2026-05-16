import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, recordsTable, collectionsTable, activityTable } from "@workspace/db";
import {
  ListRecordsParams,
  CreateRecordParams,
  CreateRecordBody,
  GetRecordParams,
  UpdateRecordParams,
  UpdateRecordBody,
  DeleteRecordParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/collections/:collectionId/records", async (req, res): Promise<void> => {
  const params = ListRecordsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const records = await db
    .select()
    .from(recordsTable)
    .where(eq(recordsTable.collectionId, params.data.collectionId))
    .orderBy(recordsTable.createdAt);
  res.json(records);
});

router.post("/collections/:collectionId/records", async (req, res): Promise<void> => {
  const params = CreateRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db
    .insert(recordsTable)
    .values({ ...parsed.data, collectionId: params.data.collectionId })
    .returning();

  const [collection] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, record.collectionId));
  if (collection) {
    await db.insert(activityTable).values({
      action: "created",
      entityType: "record",
      entityId: record.id,
      entityName: `Record #${record.id}`,
      description: `Created record in "${collection.name}"`,
      projectId: collection.projectId,
    });
  }

  res.status(201).json(record);
});

router.get("/records/:id", async (req, res): Promise<void> => {
  const params = GetRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [record] = await db.select().from(recordsTable).where(eq(recordsTable.id, params.data.id));
  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.json(record);
});

router.patch("/records/:id", async (req, res): Promise<void> => {
  const params = UpdateRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db
    .update(recordsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(recordsTable.id, params.data.id))
    .returning();
  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.json(record);
});

router.delete("/records/:id", async (req, res): Promise<void> => {
  const params = DeleteRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [record] = await db.delete(recordsTable).where(eq(recordsTable.id, params.data.id)).returning();
  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
