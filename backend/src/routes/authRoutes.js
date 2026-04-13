const express = require('express');
// Import both functions now
const { register, login } = require('../controllers/authController'); 

const router = express.Router();

router.post('/register', register);
// Add the login route
router.post('/login', login); 

module.exports = router;