import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { errorHandler, rateLimiter } from './middleware/index.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import sessionRoutes from './routes/session.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import adminRoutes from './routes/admin.routes.js';
import proRoutes from './routes/pro.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import path from 'path';
import { getPublicThemeSounds } from './controllers/adminSettings.controller.js';

const app = express();



// ─── Security Headers ─────────────────────────────────────────────
app.use(helmet());

// ─── Gzip Compression ─────────────────────────────────────────────
app.use(compression({
  threshold: parseInt(process.env.COMPRESSION_THRESHOLD_BYTES, 10) || 1024,
  level: parseInt(process.env.COMPRESSION_LEVEL, 10) || 6,
  filter(req, res) {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ─── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.CLIENT_URL || 'http://localhost:5173';
    if (!origin || origin === allowed) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowed.replace(/\/$/, '');

    if (normalizedOrigin === normalizedAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin} (Expected: ${allowed})`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));

// ─── Upstash Rate Limiting ────────────────────────────────────────
app.use("/api/", rateLimiter);

// ─── Body & Cookie Parsers ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── HTTP Request Logger ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.status(200).json({ success: true, message: 'OK', timestamp: new Date().toISOString() })
);

// ─── API Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/pro', proRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// ─── Public Theme Sounds Configuration ─────────────────────────────
app.get('/api/theme-sounds', getPublicThemeSounds);

// ─── Static Files (Uploaded Theme Sounds) ──────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── 404 Catch-all ────────────────────────────────────────────────
app.use('*', (req, res) =>
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` })
);

// ─── Global Error Handler (must be last) ──────────────────────────
app.use(errorHandler);

export default app;
