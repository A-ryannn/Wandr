const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { updateLocation, getNearbyTravelers, updateStatus } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', verifyToken, (req, res) => {
    res.json({ 
        message: 'Welcome to the protected dashboard.',
        user: req.user
    });
});
router.put('/location', verifyToken, updateLocation);
router.get('/locations/nearby', verifyToken, getNearbyTravelers);
router.put('/status', verifyToken, updateStatus);
module.exports = router;