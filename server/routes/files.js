const router = require('express').Router();
const { uploadFile, getFiles, deleteFile } = require('../controllers/fileController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/:projectId', protect, authorize('admin', 'staff'), upload.single('file'), uploadFile);
router.get('/:projectId', protect, getFiles);
router.delete('/:id', protect, authorize('admin'), deleteFile);

module.exports = router;
