const multer = require('multer');
const path = require('path');
const fs = require('fs');
 
// Auto-create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads directory');
}
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
 
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|xls|xlsx|png|jpg|jpeg|zip|txt/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    ext ? cb(null, true) : cb(new Error('File type not allowed. Accepted: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, zip, txt'));
  }
});
 
module.exports = upload;