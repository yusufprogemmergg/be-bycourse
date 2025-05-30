import express from "express";
import { createModule } from "../controllers/moduleController";
import { addLesson,updateLesson } from "../controllers/lessonController";
import { getCourseContent } from "../controllers/courseController";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload"; // middleware for video upload
import { getModulesWithLessons, getLessonById } from "../controllers/moduleController";

const router = express.Router();

router.post("/addmodule", authenticate, createModule);
router.post("/addlesson", authenticate,upload.single("video"), addLesson);
router.put("/lesson", authenticate,upload.single("video"), updateLesson);
router.get("/:courseId/content", authenticate, getCourseContent);
router.get("/module/:courseId", authenticate, getModulesWithLessons);
router.get("/lesson/:id", authenticate, getLessonById);

export default router;