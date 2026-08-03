const router = require('express').Router();
const { getMilestones, createMilestone, updateMilestone, deleteMilestone } = require('../controllers/milestoneController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:projectId', protect, getMilestones);
router.post('/:projectId', protect, authorize('admin', 'staff'), createMilestone);
router.put('/:id', protect, authorize('admin', 'staff'), updateMilestone);
router.delete('/:id', protect, authorize('admin'), deleteMilestone);

module.exports = router;
