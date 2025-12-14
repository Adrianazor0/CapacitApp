import { Router } from 'express';
import { getTeachers, createTeacher } from '../controllers/teacher.controller';

const router: Router = Router();

router.route('/')
    .get(getTeachers)
    .post(createTeacher);

export default router;