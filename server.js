import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import boardRoutes from './routes.js';
import freestyleRoutes from './freestyle/freestyle.routes.js';
import systemDesignRoutes from './system_design/systemDesign.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dragg';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/boards', boardRoutes);
app.use('/api/freestyle-boards', freestyleRoutes);
app.use('/api/system-design-boards', systemDesignRoutes);

// Start DB connection then start Server
const startServer = async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
