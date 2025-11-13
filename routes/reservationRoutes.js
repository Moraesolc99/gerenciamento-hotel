const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticate = require('../middlewares/authMiddleware');
const { ensureAdmin } = require('../middlewares/roleMiddleware');


router.get('/my', authenticate, reservationController.myReservations);

router.get('/all', authenticate, ensureAdmin, reservationController.allReservations);

// router.get('/', authenticate, ensureAdmin, reservationController.allReservations);

router.post('/', authenticate, reservationController.create);
router.put('/:id', authenticate, ensureAdmin, reservationController.update);
router.delete('/:id', authenticate, reservationController.remove);

module.exports = router;
