// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const {
  seedDatabase,
  getTransactions,
  getStatistics,
  getPriceRange,
  getCategories,
  getCombinedData
} = require('../controllers/transactionController');

// Define API routes
router.get('/seed', seedDatabase);
router.get('/transactions', getTransactions);
router.get('/statistics', getStatistics);
router.get('/price-range', getPriceRange);
router.get('/categories', getCategories);
router.get('/combined-data', getCombinedData);

module.exports = router;
