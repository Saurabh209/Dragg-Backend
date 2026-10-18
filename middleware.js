import multer from 'multer';

// In-memory storage for streaming files directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
});
