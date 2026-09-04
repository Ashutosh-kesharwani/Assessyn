import { randomUUID } from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadPath = path.resolve(process.cwd(), 'public', 'temp');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

export default storage;
