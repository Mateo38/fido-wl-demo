import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import authRoutes from './routes/auth';
import fidoRoutes from './routes/fido';
import bankingRoutes from './routes/banking';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fido', fidoRoutes);
app.use('/api', bankingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`FIDO Server running on http://localhost:${PORT}`);
});
