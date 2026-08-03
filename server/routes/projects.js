const router = require('express').Router();
const { getAllProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllProjects);
router.get('/:id', protect, getProject);
router.post('/', protect, authorize('admin'), createProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);

module.exports = router;
