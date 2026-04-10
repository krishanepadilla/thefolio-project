const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use absolute path to ensure folder is inside the backend directory
const uploadDir = path.join(__dirname, '..', 'uploads');

// Create uploads/ folder if it does not exist yet
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Where and how to save uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + random number + original extension
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

// Only allow image file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5 MB per file
});

module.exports = upload;