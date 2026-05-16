import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, activityTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  CreateUserBody,
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
  DeleteUserParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function logActivity(
  action: string,
  entityId: number,
  entityName: string,
  description: string,
  projectId?: number | null,
) {
  await db.insert(activityTable).values({
    action,
    entityType: "user",
    entityId,
    entityName,
    description,
    projectId: projectId ?? undefined,
  });
}

router.get("/users", async (req, res): Promise<void> => {
  const query = ListUsersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  let users;
  if (query.data.projectId != null) {
    users = await db.select().from(usersTable).where(eq(usersTable.projectId, query.data.projectId));
  } else {
    users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  }
  res.json(users);
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.insert(usersTable).values(parsed.data).returning();
  await logActivity("created", user.id, user.name, `Created user "${user.name}"`, user.projectId);
  res.status(201).json(user);
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, params.data.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await logActivity("updated", user.id, user.name, `Updated user "${user.name}"`, user.projectId);
  res.json(user);
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await logActivity("deleted", user.id, user.name, `Deleted user "${user.name}"`, user.projectId);
  res.sendStatus(204);
});

export default router;
