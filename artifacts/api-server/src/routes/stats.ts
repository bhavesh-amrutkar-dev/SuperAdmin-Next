import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, projectsTable, usersTable, collectionsTable, recordsTable, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const [totalProjects] = await db.select({ count: count() }).from(projectsTable);
  const [activeProjects] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.status, "active"));
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [totalCollections] = await db.select({ count: count() }).from(collectionsTable);
  const [totalRecords] = await db.select({ count: count() }).from(recordsTable);
  const [recentActivity] = await db.select({ count: count() }).from(activityTable);

  res.json({
    totalProjects: totalProjects?.count ?? 0,
    activeProjects: activeProjects?.count ?? 0,
    totalUsers: totalUsers?.count ?? 0,
    totalCollections: totalCollections?.count ?? 0,
    totalRecords: totalRecords?.count ?? 0,
    recentActivity: recentActivity?.count ?? 0,
  });
});

router.get("/stats/projects", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable);

  const stats = await Promise.all(
    projects.map(async (project) => {
      const [userCount] = await db
        .select({ count: count() })
        .from(usersTable)
        .where(eq(usersTable.projectId, project.id));
      const [collectionCount] = await db
        .select({ count: count() })
        .from(collectionsTable)
        .where(eq(collectionsTable.projectId, project.id));
      const collections = await db
        .select({ id: collectionsTable.id })
        .from(collectionsTable)
        .where(eq(collectionsTable.projectId, project.id));
      let recordCount = 0;
      for (const col of collections) {
        const [rc] = await db
          .select({ count: count() })
          .from(recordsTable)
          .where(eq(recordsTable.collectionId, col.id));
        recordCount += Number(rc?.count ?? 0);
      }
      return {
        projectId: project.id,
        projectName: project.name,
        userCount: Number(userCount?.count ?? 0),
        collectionCount: Number(collectionCount?.count ?? 0),
        recordCount,
      };
    }),
  );

  res.json(stats);
});

export default router;
