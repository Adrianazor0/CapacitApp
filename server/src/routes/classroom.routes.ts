import { Router } from 'express';
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from '../controllers/classroom.controller';

const router = Router();

router.route('/')
  .get(getClassrooms)
  .post(createClassroom);

router.route('/:id')
  .put(updateClassroom)
  .delete(deleteClassroom);

export default router;