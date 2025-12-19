import { Router } from 'express';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../controllers/teacher.controller';

const router: Router = Router();

router.route('/')
    .get(getTeachers)
    .post(createTeacher);

router.route('/:id')
  .put(updateTeacher)
  .delete(deleteTeacher);

export default router;