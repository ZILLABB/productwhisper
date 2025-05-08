import express from 'express';
import { body, query } from 'express-validator';
import * as comparisonController from '../controllers/comparisonController';

const router = express.Router();

// Compare products (POST)
router.post(
  '/',
  [
    body('product_ids')
      .isArray({ min: 2 })
      .withMessage('At least two product IDs are required'),
    body('product_ids.*')
      .isInt()
      .withMessage('Product IDs must be integers')
  ],
  comparisonController.compareProducts
);

// Quick compare products (GET)
router.get(
  '/quick',
  [
    query('ids')
      .notEmpty()
      .withMessage('Product IDs are required')
  ],
  comparisonController.quickCompare
);

export default router;
