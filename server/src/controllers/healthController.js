const ApiResponse = require('../utils/ApiResponse');

/**
 * Health check route handler.
 */
const healthCheck = (req, res) => {
  ApiResponse.success(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, 'Server is running');
};

module.exports = { healthCheck };
