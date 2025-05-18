const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const wallet = await Wallet.findOne({ userId: user._id });
    
    res.status(200).json({
      user,
      wallet: {
        points: wallet ? wallet.points : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        name, 
        phoneNumber,
        updatedAt: Date.now() 
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
