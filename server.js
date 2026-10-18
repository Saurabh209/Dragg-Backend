import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import canvasRoutes from './routes.js';
// import commonRoutes from './common.routes.js';
import { imgUploader, deleteImage } from "./controller.js";
import { upload } from "./middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dragg";

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Board Routes
app.use('/api/freestyle_board', canvasRoutes);
app.use('/api/system_board', canvasRoutes);

app.post('/api/uploads_img', upload.single('image'), imgUploader);
app.post('/api/delete_img', deleteImage);


// Start DB connection then start Server
const startServer = async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
