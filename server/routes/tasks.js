const router = require('express').Router();
const { createTask, updateTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:milestoneId', protect, authorize('admin', 'staff'), createTask);
router.put('/:id', protect, authorize('admin', 'staff'), updateTask);
router.patch('/:id/status', protect, authorize('admin', 'staff'), updateTaskStatus);
router.delete('/:id', protect, authorize('admin'), deleteTask);

module.exports = router;
