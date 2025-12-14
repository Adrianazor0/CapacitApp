import { Router } from 'express';
import { getGroups, createGroup } from '../controllers/group.controller';

const router: Router = Router();

router.route('/')
    .get(getGroups)
    .post(createGroup);

export default router;