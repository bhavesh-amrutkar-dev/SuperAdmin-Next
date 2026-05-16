import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import usersRouter from "./users";
import collectionsRouter from "./collections";
import recordsRouter from "./records";
import activityRouter from "./activity";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(usersRouter);
router.use(collectionsRouter);
router.use(recordsRouter);
router.use(activityRouter);
router.use(statsRouter);

export default router;
