import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { apiLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { globalErrorHandler } from './middleware/error.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Gzip Compression
app.use(compression());

// Logging
app.use(morgan('dev'));

// Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Default 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
