const Analytics = require('../models/Analytics');
const Url = require('../models/Url');

const verifyOwnership = async (urlId, userId) => {
  const url = await Url.findOne({ _id: urlId, owner: userId });
  return !!url;
};

exports.getUrlAnalytics = async (req, res, next) => {
  try {
    const { urlId } = req.params;
    const { period = '30d' } = req.query;

    const owned = await verifyOwnership(urlId, req.user._id);
    if (!owned) return res.status(403).json({ success: false, message: 'Access denied' });

    const periodMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = periodMap[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [clicks, countries, browsers, devices, dailyClicks] = await Promise.all([
      Analytics.countDocuments({ urlId, clickedAt: { $gte: startDate } }),

      Analytics.aggregate([
        { $match: { urlId: require('mongoose').Types.ObjectId.createFromHexString(urlId), clickedAt: { $gte: startDate } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      Analytics.aggregate([
        { $match: { urlId: require('mongoose').Types.ObjectId.createFromHexString(urlId), clickedAt: { $gte: startDate } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      Analytics.aggregate([
        { $match: { urlId: require('mongoose').Types.ObjectId.createFromHexString(urlId), clickedAt: { $gte: startDate } } },
        { $group: { _id: '$device', count: { $sum: 1 } } }
      ]),

      Analytics.aggregate([
        { $match: { urlId: require('mongoose').Types.ObjectId.createFromHexString(urlId), clickedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        totalClicks: clicks,
        countries: countries.map(c => ({ name: c._id, clicks: c.count })),
        browsers: browsers.map(b => ({ name: b._id, clicks: b.count })),
        devices: devices.map(d => ({ name: d._id, clicks: d.count })),
        dailyClicks: dailyClicks.map(d => ({ date: d._id, clicks: d.count }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getOverallAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const periodMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = periodMap[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userUrls = await Url.find({ owner: req.user._id }).select('_id');
    const urlIds = userUrls.map(u => u._id);

    const [totalClicks, topCountries, deviceBreakdown, dailyTrend] = await Promise.all([
      Analytics.countDocuments({ urlId: { $in: urlIds }, clickedAt: { $gte: startDate } }),

      Analytics.aggregate([
        { $match: { urlId: { $in: urlIds }, clickedAt: { $gte: startDate } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      Analytics.aggregate([
        { $match: { urlId: { $in: urlIds }, clickedAt: { $gte: startDate } } },
        { $group: { _id: '$device', count: { $sum: 1 } } }
      ]),

      Analytics.aggregate([
        { $match: { urlId: { $in: urlIds }, clickedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        totalClicks,
        topCountries: topCountries.map(c => ({ name: c._id, clicks: c.count })),
        deviceBreakdown: deviceBreakdown.map(d => ({ name: d._id, clicks: d.count })),
        dailyTrend: dailyTrend.map(d => ({ date: d._id, clicks: d.count }))
      }
    });
  } catch (err) {
    next(err);
  }
};
