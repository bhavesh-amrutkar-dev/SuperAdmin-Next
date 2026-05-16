import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, activityTable } from "@workspace/db";
import { ListActivityQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/activity", async (req, res): Promise<void> => {
  const query = ListActivityQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const limit = query.data.limit ?? 50;

  let items;
  if (query.data.projectId != null) {
    items = await db
      .select()
      .from(activityTable)
      .where(eq(activityTable.projectId, query.data.projectId))
      .orderBy(desc(activityTable.createdAt))
      .limit(limit);
  } else {
    items = await db
      .select()
      .from(activityTable)
      .orderBy(desc(activityTable.createdAt))
      .limit(limit);
  }

  res.json(items);
});

export default router;
