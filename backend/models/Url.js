const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required']
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_-]+$/, 'Alias can only contain letters, numbers, hyphens and underscores']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  qrCode: {
    type: String
  },
  expiryDate: {
    type: Date,
    default: null
  },
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

urlSchema.virtual('shortUrl').get(function() {
  return `${process.env.BASE_URL}/${this.customAlias || this.shortCode}`;
});

urlSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

urlSchema.index({ owner: 1, createdAt: -1 });
urlSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', urlSchema);
