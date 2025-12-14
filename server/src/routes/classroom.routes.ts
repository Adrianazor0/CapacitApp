import { Router } from 'express';
import { getClassrooms, createClassroom } from '../controllers/classroom.controller';

const router: Router = Router();

router.route('/')
    .get(getClassrooms)
    .post(createClassroom);

export default router;