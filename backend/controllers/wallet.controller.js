const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');

exports.getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    res.status(200).json({
      points: wallet.points,
      transactions: wallet.transactions.slice(0, 10) // Return latest 10 transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const totalTransactions = wallet.transactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);
    
    const transactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);
    
    res.status(200).json({
      points: wallet.points,
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add funds to user's wallet
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} JSON response
 */
exports.addFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    // Find user's wallet
    let wallet = await Wallet.findOne({ userId: req.userId });
    
    // If wallet doesn't exist, create one
    if (!wallet) {
      wallet = new Wallet({
        userId: req.userId,
        points: 0,
        transactions: []
      });
    }
    
    // Add funds
    const parsedAmount = parseFloat(amount);
    wallet.points += parsedAmount;
    
    // Add transaction record
    wallet.transactions.push({
      type: 'credit',
      amount: parsedAmount,
      description: 'Added funds to wallet',
      createdAt: new Date()
    });
    
    // Save wallet
    await wallet.save();
    
    res.status(200).json({
      message: 'Funds added successfully',
      points: wallet.points,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};