import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();

// Middlewares
app.use(cors());
// Set limits high enough to handle Base64 encoded photos/documents
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base test route
app.get('/', (req, res) => {
  res.json({ message: 'Hire Me API is running smoothly.' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message, err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
