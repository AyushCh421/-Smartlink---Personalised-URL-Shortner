const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      apiKey: user.apiKey,
      createdAt: user.createdAt
    }
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    user.generateApiKey();
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${email}`);
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    logger.info(`User logged in: ${email}`);
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      apiKey: req.user.apiKey,
      createdAt: req.user.createdAt
    }
  });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.regenerateApiKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const newKey = user.generateApiKey();
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, apiKey: newKey });
  } catch (err) {
    next(err);
  }
};
