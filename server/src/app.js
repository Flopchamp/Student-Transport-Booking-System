const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// ------------------------------------
// Security Middleware
// ------------------------------------
app.use(helmet());

// ------------------------------------
// CORS
// ------------------------------------
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ------------------------------------
// Rate Limiting
// ------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ------------------------------------
// Body Parsing
// ------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------------------------
// Logging
// ------------------------------------
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ------------------------------------
// API Routes
// ------------------------------------
app.use('/api/v1', routes);

// ------------------------------------
// 404 Handler
// ------------------------------------
app.all('*', (req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.method} ${req.originalUrl}`));
});

// ------------------------------------
// Global Error Handler
// ------------------------------------
app.use(errorHandler);

module.exports = app;
