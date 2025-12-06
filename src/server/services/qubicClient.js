const axios = require('axios');
const logger = require('../utils/logger');
const { evaluateTx } = require('./ruleEngine');

const RPC_BASE = process.env.RPC_BASE_URL || 'https://rpc.qubic.org/';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '2000', 10);

let latestTick = null;

async function fetchTickInfo() {
  try {
    const res = await axios.get(`${RPC_BASE}v1/tick-info`, { timeout: 5000 });
    return res.data;
  } catch (err) {
    logger.error('Failed tick-info:', err.message);
    return null;
  }
}

async function fetchTickTransactions(tickNumber) {
  try {
    const res = await axios.get(`${RPC_BASE}v2/ticks/${tickNumber}/transactions`, { timeout: 5000 });
    return res.data.transactions || [];
  } catch (err) {
    logger.error('Failed transactions:', err.message);
    return [];
  }
}

async function poll() {
  try {
    const info = await fetchTickInfo();
    const tick = info?.tick || info?.tickInfo?.tick;
    
    if (tick && tick !== latestTick) {
      latestTick = tick;
      logger.info(`Processing tick ${tick}`);
      
      const txs = await fetchTickTransactions(tick);
      for (const tx of txs) {
        const result = evaluateTx(tx);
        if (result && result.alert) {
          const easyConnect = require('./easyConnect');
          await easyConnect.sendAlert(result.payload);
        }
      }
    }
  } catch (err) {
    logger.error('Poll error:', err.message);
  } finally {
    setTimeout(poll, POLL_INTERVAL);
  }
}

function startPolling() {
  logger.info('🚀 Starting Qubic Sentinel polling...');
  poll();
}

module.exports = { startPolling };
