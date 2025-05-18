const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const config = require('../config/auth.config');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      phoneNumber
    });
    
    await user.save();
    
    // Create wallet for the user
    const wallet = new Wallet({
      userId: user._id,
      points: role === 'student' ? 100 : 0 // Give 100 points to new students
    });
    
    await wallet.save();
    
    // Generate token
    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: config.expiresIn
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: config.expiresIn
    });
    
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};