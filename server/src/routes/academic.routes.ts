import { Router } from 'express';
import { takeAttendance, updateEnrollmentStatus } from '../controllers/academic.controller';

export const router = Router();

router.post('/attendance', takeAttendance);
router.put('/status', updateEnrollmentStatus);

export default router;