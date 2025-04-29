import multer from 'multer';
import path from 'path';

// Set tempat penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));  // path ke /uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext); // misal: 1745753678830.png
  }
});

export const upload = multer({ storage });
