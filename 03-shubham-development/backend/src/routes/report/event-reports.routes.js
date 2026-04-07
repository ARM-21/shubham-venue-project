import express from 'express';
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import { isAdmin } from '../../middleware/auth.middleware.js';
import {
  submitEventReport,
  getEventReports,
  getReportDetail,
  resolveEventReport,
  dismissEventReport,
  getReportStats,
  checkUserReport,
} from '../../controllers/report/event-report.controller.js';

const router = express.Router();

// Public routes (authenticated users can report)
router.post('/submit', isAuthenticated, submitEventReport);
router.get('/check/:eventId', isAuthenticated, checkUserReport);

// Admin routes
router.get('/admin/stats', isAuthenticated, isAdmin, getReportStats);
router.get('/admin', isAuthenticated, isAdmin, getEventReports);
router.get('/admin/:reportId', isAuthenticated, isAdmin, getReportDetail);
router.patch('/admin/:reportId/resolve', isAuthenticated, isAdmin, resolveEventReport);
router.post('/admin/:reportId/dismiss', isAuthenticated, isAdmin, dismissEventReport);

export default router;
