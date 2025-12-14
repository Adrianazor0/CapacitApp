import { Router } from 'express';
import { getPrograms, createProgram } from '../controllers/program.controller';

const router: Router = Router();

router.route('/')
    .get(getPrograms)
    .post(createProgram);

export default router;