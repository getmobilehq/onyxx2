import multer from 'multer';
import { ValidationError } from '../lib/errors.js';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only image files are allowed'));
  }
};

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
