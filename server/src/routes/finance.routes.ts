import { Router } from 'express';
import { enrollStudent, addPayment, getGroupFinantials, addGrade, getRecentTransactions } from '../controllers/finance.controller';

const router: Router = Router();

router.post('/enroll', enrollStudent)
router.post('/pay', addPayment)
router.get('/groups/:groupId', getGroupFinantials)
router.get('/transactions', getRecentTransactions);
router.post('/grades', addGrade); // NUEVA RUTA

export default router;