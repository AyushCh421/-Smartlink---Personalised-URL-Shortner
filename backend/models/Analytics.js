const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    enum: ['Mobile', 'Desktop', 'Tablet', 'Unknown'],
    default: 'Unknown'
  },
  ipAddress: {
    type: String
  },
  referer: {
    type: String,
    default: 'Direct'
  },
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

analyticsSchema.index({ urlId: 1, clickedAt: -1 });
analyticsSchema.index({ urlId: 1, country: 1 });
analyticsSchema.index({ urlId: 1, device: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
