import express from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import searchRoutes from './search';
import notificationRoutes from './notifications';
import recommendationRoutes from './recommendations';
import trendRoutes from './trends';
import comparisonRoutes from './comparison';
import analyticsRoutes from './analytics';
import conversionRoutes from './conversions';

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/trends', trendRoutes);
router.use('/compare', comparisonRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/conversions', conversionRoutes);

export default router;
