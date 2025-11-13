const express = require('express');
const router = express.Router();
const roomCtrl = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');
const { ensureAdmin } = require('../middlewares/roleMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', roomCtrl.listAll);
router.get('/:id', roomCtrl.getById);
router.post('/', authMiddleware, ensureAdmin, upload.single('image'), roomCtrl.create);
router.put('/:id', authMiddleware, ensureAdmin, upload.single('image'), roomCtrl.update);
router.delete('/:id', authMiddleware, ensureAdmin, roomCtrl.remove);

module.exports = router;
