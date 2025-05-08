import express from 'express';
import { body, param } from 'express-validator';
import * as productController from '../controllers/productController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create a new product (admin only)
router.post(
  '/',
  authenticateToken,
  isAdmin,
  [
    body('name')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name is required and must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isString(),
    body('category')
      .optional()
      .isString(),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Must be a valid URL'),
    body('price')
      .optional()
      .isNumeric()
      .withMessage('Price must be a number'),
    body('brand')
      .optional()
      .isString()
  ],
  productController.createProduct
);

// Update a product (admin only)
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  [
    param('id')
      .isInt()
      .withMessage('Product ID must be an integer'),
    body('name')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isString(),
    body('category')
      .optional()
      .isString(),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('Must be a valid URL'),
    body('price')
      .optional()
      .isNumeric()
      .withMessage('Price must be a number'),
    body('brand')
      .optional()
      .isString()
  ],
  productController.updateProduct
);

// Delete a product (admin only)
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  [
    param('id')
      .isInt()
      .withMessage('Product ID must be an integer')
  ],
  productController.deleteProduct
);

export default router;
