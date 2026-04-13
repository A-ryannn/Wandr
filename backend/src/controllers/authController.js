const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail } = require('../models/userModel');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        const newUser = await createUser(username, email, passwordHash);
        
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Registration Error:', error);
        // TEMPORARY DEBUGGING LINE: Send the exact database error back
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: error.message,
            detail: error.detail
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Check if the user exists
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // 2. Compare the typed password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // 3. Generate the JWT "Wristband" (valid for 1 hour)
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        // 4. Send the token to the frontend
        res.json({
            message: 'Login successful',
            token: token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 3. DON'T FORGET TO EXPORT IT!
module.exports = { register, login };