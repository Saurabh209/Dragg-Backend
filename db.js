import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'db.json');

let useLocal = false;

export const isLocalFallback = () => useLocal;

export const getLocalDB = async () => {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      await fs.promises.writeFile(LOCAL_DB_PATH, JSON.stringify({ boards: [] }, null, 2));
      return { boards: [] };
    }
    const data = await fs.promises.readFile(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local db:', err);
    return { boards: [] };
  }
};

export const saveLocalDB = async (data) => {
  try {
    await fs.promises.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local db:', err);
  }
};

export const isMongoConnected = () => !useLocal && mongoose.connection.readyState === 1;

export const connectDB = async (mongoUri) => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Timeout after 3 seconds
    });
    console.log('Successfully connected to MongoDB!');
    useLocal = false;
  } catch (error) {
    console.warn('MongoDB connection failed. Falling back to local JSON database (db.json).');
    console.warn(`Error details: ${error.message}`);
    useLocal = true;
    await readLocalDB();
  }
};

// Re-export controller helper methods for backwards compatibility with seeder scripts
export {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  patchBoard,
  deleteBoard,
  verifyPassword,
  hashPassword
} from './controller.js';
