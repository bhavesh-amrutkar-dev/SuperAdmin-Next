import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, collectionsTable, activityTable } from "@workspace/db";
import {
  ListCollectionsParams,
  CreateCollectionParams,
  CreateCollectionBody,
  GetCollectionParams,
  UpdateCollectionParams,
  UpdateCollectionBody,
  DeleteCollectionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function logActivity(
  action: string,
  entityId: number,
  entityName: string,
  description: string,
  projectId: number,
) {
  await db.insert(activityTable).values({
    action,
    entityType: "collection",
    entityId,
    entityName,
    description,
    projectId,
  });
}

router.get("/projects/:projectId/collections", async (req, res): Promise<void> => {
  const params = ListCollectionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const collections = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.projectId, params.data.projectId))
    .orderBy(collectionsTable.createdAt);
  res.json(collections);
});

router.post("/projects/:projectId/collections", async (req, res): Promise<void> => {
  const params = CreateCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [collection] = await db
    .insert(collectionsTable)
    .values({ ...parsed.data, projectId: params.data.projectId })
    .returning();
  await logActivity("created", collection.id, collection.name, `Created collection "${collection.name}"`, collection.projectId);
  res.status(201).json(collection);
});

router.get("/collections/:id", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [collection] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, params.data.id));
  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  res.json(collection);
});

router.patch("/collections/:id", async (req, res): Promise<void> => {
  const params = UpdateCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [collection] = await db
    .update(collectionsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(collectionsTable.id, params.data.id))
    .returning();
  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  await logActivity("updated", collection.id, collection.name, `Updated collection "${collection.name}"`, collection.projectId);
  res.json(collection);
});

router.delete("/collections/:id", async (req, res): Promise<void> => {
  const params = DeleteCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [collection] = await db.delete(collectionsTable).where(eq(collectionsTable.id, params.data.id)).returning();
  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  await logActivity("deleted", collection.id, collection.name, `Deleted collection "${collection.name}"`, collection.projectId);
  res.sendStatus(204);
});

export default router;
