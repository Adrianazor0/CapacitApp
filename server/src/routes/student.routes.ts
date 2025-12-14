import { Router } from 'express';
import { getStudents, createStudent } from '../controllers/student.controller';

const router: Router = Router();

router.route('/')
    .get(getStudents)
    .post(createStudent);

export default router;