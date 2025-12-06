const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const routes = require('./routes');
const logger = require('./utils/logger');
const { startPolling } = require('./services/qubicClient');
app.use(express.static('.')); // Serve dashboard.html


const app = express();
app.use(bodyParser.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Qubic Sentinel Lite listening on port ${PORT}`);
  // start background worker after server starts
  startPolling();
});

// graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  process.exit(0);
});
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

