import express from "express";
import { createModule } from "../controllers/moduleController";
import { createLesson,updateLesson } from "../controllers/lessonController";
import { getCourseContent } from "../controllers/courseController";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload"; // middleware for video upload
import { getModulesWithLessons, getLessonById } from "../controllers/moduleController";

const router = express.Router();

router.post("/modules", authenticate, createModule);
router.post("/lessons", authenticate,upload.single("video"), createLesson);
router.put("/lessons", authenticate,upload.single("video"), updateLesson);
router.get("/:courseId/content", authenticate, getCourseContent);
router.get("/:courseId/modules", authenticate, getModulesWithLessons);
router.get("/lessons/:id", authenticate, getLessonById);

export default router;