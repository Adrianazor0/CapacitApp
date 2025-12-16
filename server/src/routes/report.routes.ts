import { Router } from 'express';
import { getDashboardStats, getPaymentsReport, getDebtorsReport } from '../controllers/report.controller';

const router = Router();

router.get('/dashboard', getDashboardStats);
router.get('/payments', getPaymentsReport); 
router.get('/debtors', getDebtorsReport);

export default router;