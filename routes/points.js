const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

// @route   GET api/points/balance
// @desc    Get user's current point balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('points');
    res.json({ points: user.points });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/points/history
// @desc    Get user's point transaction history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await PointTransaction.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/points/add
// @desc    Add points to a user (admin only)
// @access  Private/Admin
router.post(
  '/add',
  [
    auth,
    admin,
    [
      check('userId', 'User ID is required').not().isEmpty(),
      check('points', 'Points value is required and must be positive').isInt({ min: 1 }),
      check('reason', 'Reason is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, points, reason } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Add points to user
      user.points += points;
      await user.save();

      // Create transaction record
      const transaction = new PointTransaction({
        user: userId,
        amount: points,
        type: 'credit',
        reason,
        performedBy: req.user.id
      });

      await transaction.save();

      res.json({ 
        msg: `${points} points added to user ${user.name}`,
        currentPoints: user.points
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/points/deduct
// @desc    Deduct points from a user (admin only)
// @access  Private/Admin
router.post(
  '/deduct',
  [
    auth,
    admin,
    [
      check('userId', 'User ID is required').not().isEmpty(),
      check('points', 'Points value is required and must be positive').isInt({ min: 1 }),
      check('reason', 'Reason is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, points, reason } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if user has enough points
      if (user.points < points) {
        return res.status(400).json({ 
          msg: `User doesn't have enough points. Available: ${user.points}, Requested: ${points}` 
        });
      }

      // Deduct points from user
      user.points -= points;
      await user.save();

      // Create transaction record
      const transaction = new PointTransaction({
        user: userId,
        amount: points,
        type: 'debit',
        reason,
        performedBy: req.user.id
      });

      await transaction.save();

      res.json({ 
        msg: `${points} points deducted from user ${user.name}`,
        currentPoints: user.points
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;