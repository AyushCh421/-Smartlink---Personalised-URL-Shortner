require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const redirectRoutes = require('./routes/redirect');

const app = express();

connectDB();
redisClient.connect().catch(err => logger.error('Redis connection failed:', err));

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', redirectRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`SmartLink server running on port ${PORT}`));
