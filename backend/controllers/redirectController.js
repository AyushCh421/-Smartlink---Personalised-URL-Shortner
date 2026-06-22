const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const getLocationFromIP = async (ip) => {
  try {
    if (ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168')) {
      return { country: 'Local', city: 'Local' };
    }
    const { default: axios } = await import('axios');
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=country,city`, { timeout: 3000 });
    return { country: res.data.country || 'Unknown', city: res.data.city || 'Unknown' };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
};

const parseUserAgent = (uaString) => {
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  let device = 'Desktop';
  if (result.device.type === 'mobile') device = 'Mobile';
  else if (result.device.type === 'tablet') device = 'Tablet';

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    device
  };
};

exports.redirectUrl = async (req, res, next) => {
  try {
    const { code } = req.params;

    let urlData = null;
    const cacheKey = `url:${code}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        urlData = JSON.parse(cached);
        logger.info(`Cache hit for: ${code}`);
      }
    } catch {}

    if (!urlData) {
      const url = await Url.findOne({
        $or: [{ shortCode: code }, { customAlias: code }],
        isActive: true
      }).select('+password');

      if (!url) {
        return res.status(404).send('<h1>404 - Link not found</h1><p>This link does not exist or has been removed.</p>');
      }

      urlData = {
        _id: url._id.toString(),
        originalUrl: url.originalUrl,
        expiryDate: url.expiryDate,
        isPasswordProtected: url.isPasswordProtected,
        password: url.password
      };

      try {
        if (!url.isPasswordProtected) {
          await redisClient.setEx(cacheKey, 3600, JSON.stringify(urlData));
        }
      } catch {}
    }

    if (urlData.expiryDate && new Date() > new Date(urlData.expiryDate)) {
      return res.redirect(`${process.env.CLIENT_URL}/expired?code=${code}`);
    }

    if (urlData.isPasswordProtected) {
      return res.redirect(`${process.env.CLIENT_URL}/protected?code=${code}`);
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'] || '';
    const { browser, os, device } = parseUserAgent(ua);
    const { country, city } = await getLocationFromIP(ip);

    setImmediate(async () => {
      try {
        await Promise.all([
          Analytics.create({
            urlId: urlData._id,
            country,
            city,
            browser,
            os,
            device,
            ipAddress: ip,
            referer: req.headers.referer || 'Direct'
          }),
          Url.findByIdAndUpdate(urlData._id, { $inc: { totalClicks: 1 } })
        ]);
      } catch (err) {
        logger.error('Analytics write error:', err);
      }
    });

    res.redirect(301, urlData.originalUrl);
  } catch (err) {
    next(err);
  }
};
