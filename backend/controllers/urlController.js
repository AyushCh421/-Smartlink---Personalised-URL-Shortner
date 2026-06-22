const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const CACHE_TTL = 3600;

const generateQRCode = async (url) => {
  try {
    return await QRCode.toDataURL(url, { width: 300, margin: 2 });
  } catch {
    return null;
  }
};

exports.createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiryDate, password, title, tags } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Original URL is required' });
    }

    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    if (customAlias) {
      const taken = await Url.findOne({ $or: [{ customAlias }, { shortCode: customAlias }] });
      if (taken) {
        return res.status(409).json({ success: false, message: 'This alias is already taken' });
      }
    }

    const shortCode = nanoid(7);
    const shortUrl = `${process.env.BASE_URL}/${customAlias || shortCode}`;
    const qrCode = await generateQRCode(shortUrl);

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias || undefined,
      owner: req.user._id,
      title: title || null,
      qrCode,
      expiryDate: expiryDate || null,
      isPasswordProtected: !!password,
      password: hashedPassword,
      tags: tags || []
    });

    logger.info(`URL created: ${shortCode} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      url: {
        ...url.toObject(),
        shortUrl,
        password: undefined
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserUrls = async (req, res, next) => {
  try {
    const { search, status, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const query = { owner: req.user._id };

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.$or = [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }];
      query.isActive = true;
    } else if (status === 'expired') {
      query.expiryDate = { $lt: new Date() };
    }

    const sortOptions = {
      '-createdAt': { createdAt: -1 },
      'createdAt': { createdAt: 1 },
      '-totalClicks': { totalClicks: -1 },
      'totalClicks': { totalClicks: 1 }
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Url.countDocuments(query);

    const urls = await Url.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-password');

    const urlsWithMeta = urls.map(url => ({
      ...url.toObject(),
      shortUrl: `${process.env.BASE_URL}/${url.customAlias || url.shortCode}`,
      isExpired: url.expiryDate ? new Date() > url.expiryDate : false
    }));

    res.json({
      success: true,
      urls: urlsWithMeta,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUrlById = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, owner: req.user._id }).select('-password');
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    res.json({
      success: true,
      url: {
        ...url.toObject(),
        shortUrl: `${process.env.BASE_URL}/${url.customAlias || url.shortCode}`
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUrl = async (req, res, next) => {
  try {
    const { title, expiryDate, isActive, tags, password, customAlias } = req.body;

    const url = await Url.findOne({ _id: req.params.id, owner: req.user._id });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    if (customAlias && customAlias !== url.customAlias) {
      const taken = await Url.findOne({ customAlias, _id: { $ne: url._id } });
      if (taken) return res.status(409).json({ success: false, message: 'Alias already taken' });
      url.customAlias = customAlias;
    }

    if (title !== undefined) url.title = title;
    if (expiryDate !== undefined) url.expiryDate = expiryDate;
    if (isActive !== undefined) url.isActive = isActive;
    if (tags !== undefined) url.tags = tags;

    if (password) {
      url.password = await bcrypt.hash(password, 10);
      url.isPasswordProtected = true;
    }

    await url.save();

    await redisClient.del(`url:${url.shortCode}`);
    if (url.customAlias) await redisClient.del(`url:${url.customAlias}`);

    res.json({ success: true, url });
  } catch (err) {
    next(err);
  }
};

exports.deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    await Analytics.deleteMany({ urlId: url._id });
    await redisClient.del(`url:${url.shortCode}`);
    if (url.customAlias) await redisClient.del(`url:${url.customAlias}`);

    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [total, active, expired, clicksResult] = await Promise.all([
      Url.countDocuments({ owner: userId }),
      Url.countDocuments({ owner: userId, isActive: true, $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }] }),
      Url.countDocuments({ owner: userId, expiryDate: { $lt: now } }),
      Url.aggregate([{ $match: { owner: userId } }, { $group: { _id: null, total: { $sum: '$totalClicks' } } }])
    ]);

    const topLinks = await Url.find({ owner: userId })
      .sort({ totalClicks: -1 })
      .limit(5)
      .select('originalUrl shortCode customAlias totalClicks title createdAt');

    res.json({
      success: true,
      stats: {
        totalLinks: total,
        activeLinks: active,
        expiredLinks: expired,
        totalClicks: clicksResult[0]?.total || 0,
        topLinks
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPassword = async (req, res, next) => {
  try {
    const { shortCode, password } = req.body;
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }]
    }).select('+password');

    if (!url) return res.status(404).json({ success: false, message: 'Link not found' });

    const match = await bcrypt.compare(password, url.password);
    if (!match) return res.status(401).json({ success: false, message: 'Wrong password' });

    res.json({ success: true, originalUrl: url.originalUrl });
  } catch (err) {
    next(err);
  }
};
