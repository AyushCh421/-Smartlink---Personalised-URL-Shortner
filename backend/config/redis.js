const { createClient } = require('redis');

let redisClient = null;
let isReady = false;

try {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 3000,
      reconnectStrategy: (retries) => {
        if (retries > 3) return false;
        return Math.min(retries * 100, 1000);
      }
    }
  });

  redisClient.on('error', () => { isReady = false; });
  redisClient.on('ready', () => { isReady = true; });
  redisClient.on('end', () => { isReady = false; });
} catch {}

const safeRedis = {
  connect: async () => {
    try { if (redisClient) await redisClient.connect(); } catch {}
  },
  get: async (key) => {
    try { return (redisClient && isReady) ? await redisClient.get(key) : null; } catch { return null; }
  },
  setEx: async (key, ttl, value) => {
    try { if (redisClient && isReady) await redisClient.setEx(key, ttl, value); } catch {}
  },
  del: async (key) => {
    try { if (redisClient && isReady) await redisClient.del(key); } catch {}
  }
};

module.exports = safeRedis;
