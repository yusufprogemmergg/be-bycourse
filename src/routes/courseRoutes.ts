import express from 'express';
import { createCourse, listCourses, getCourseById,listUserCourses,getAvailableCourses,updateCourse } from '../controllers/courseController';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload'; // middleware untuk upload gambar

const router = express.Router();

router.post('/', authenticate, upload.single('image'), createCourse); // jual course
router.get('/', listCourses); // lihat semua course
router.get('/:id', getCourseById); // lihat detail course
router.get('/other', authenticate, getAvailableCourses); // list course orang lain
router.get('/me', authenticate, listUserCourses);
router.put('/:id', authenticate, upload.single('image'), updateCourse); // update course

export default router;
