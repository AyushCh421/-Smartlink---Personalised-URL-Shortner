const User = require('../models/User');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalUrls, totalClicks, recentUsers, recentUrls] = await Promise.all([
      User.countDocuments(),
      Url.countDocuments(),
      Analytics.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Url.find().sort({ createdAt: -1 }).limit(5).populate('owner', 'name email').select('originalUrl shortCode totalClicks createdAt')
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsersThisMonth, newUrlsThisMonth] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Url.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalUrls,
        totalClicks,
        newUsersThisMonth,
        newUrlsThisMonth,
        recentUsers,
        recentUrls
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const urlCount = await Url.countDocuments({ owner: user._id });
        return { ...user.toObject(), urlCount };
      })
    );

    res.json({ success: true, users: usersWithStats, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const urls = await Url.find({ owner: user._id }).select('_id');
    const urlIds = urls.map(u => u._id);

    await Promise.all([
      Url.deleteMany({ owner: user._id }),
      Analytics.deleteMany({ urlId: { $in: urlIds } }),
      User.findByIdAndDelete(user._id)
    ]);

    res.json({ success: true, message: 'User and all associated data deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getAllUrls = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Url.countDocuments();
    const urls = await Url.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name email');

    res.json({ success: true, urls, total });
  } catch (err) {
    next(err);
  }
};
