import { Router } from 'express';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../controllers/program.controller';

const router: Router = Router();

router.route('/')
    .get(getPrograms)
    .post(createProgram);

router.route('/:id')
  .put(updateProgram)     // Editar
  .delete(deleteProgram);

export default router;