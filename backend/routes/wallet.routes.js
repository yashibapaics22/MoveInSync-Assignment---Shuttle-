const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @route GET /api/wallet/balance
 * @description Get wallet balance for authenticated user
 * @access Private
 */
router.get('/balance', verifyToken, walletController.getWalletBalance);

/**
 * @route GET /api/wallet/transactions
 * @description Get transaction history for authenticated user
 * @access Private
 */
router.get('/transactions', verifyToken, walletController.getTransactionHistory);

/**
 * @route POST /api/wallet/add-funds
 * @description Add funds to wallet
 * @access Private
 */
router.post('/add-funds', verifyToken, walletController.addFunds);

module.exports = router;