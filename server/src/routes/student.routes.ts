import { Router } from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller';

const router: Router = Router();

router.route('/')
    .get(getStudents)
    .post(createStudent);

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

export default router;