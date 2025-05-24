// middleware/upload.ts
import multer from 'multer';
import path from 'path';
import os from 'os';

const storage = multer.diskStorage({
  destination: os.tmpdir(), // tempat aman sementara
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });
