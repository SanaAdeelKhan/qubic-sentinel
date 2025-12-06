const axios = require('axios');
const logger = require('../utils/logger');

const WEBHOOK_URL = process.env.EASYCONNECT_WEBHOOK_URL || '';

async function sendAlert(payload) {
  if (!WEBHOOK_URL) {
    logger.warn('EasyConnect webhook not configured; dropping alert');
    return;
  }

  // DEBUG: Log exact payload
  logger.info('🔗 WEBHOOK URL LOADED:', WEBHOOK_URL.substring(0, 30) + '...');
  logger.info('📤 ORIGINAL PAYLOAD:', JSON.stringify(payload, null, 2));

  try {
    // FIX: Force Discord/EasyConnect format
    const discordPayload = {
      content: payload.content || 
               `🦈 ${(payload.amount || 0)} QU | ${payload.from || 'unknown'} → ${payload.to || 'unknown'} | Tick: ${payload.tick || 'N/A'}`
    };

    logger.info('📤 FIXED PAYLOAD:', JSON.stringify(discordPayload));

    const res = await axios.post(WEBHOOK_URL, discordPayload, { 
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    logger.info(`✅ Forwarded alert to EasyConnect (status ${res.status})`);
  } catch (err) {
    logger.error('❌ Failed to forward alert:', err.response?.status, err.message);
  }
}

module.exports = { sendAlert };
