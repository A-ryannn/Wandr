const db = require('../config/db');

const updateLocation = async (req, res) => {
    try {
        // req.user comes from your authMiddleware!
        const userId = req.user.id; 
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // PostGIS uses ST_MakePoint(longitude, latitude) - Note the order!
        const result = await db.query(
            `UPDATE users 
             SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) 
             WHERE id = $3 
             RETURNING id, username`,
            [longitude, latitude, userId] // PostGIS expects Longitude first
        );

        res.json({ 
            message: 'Location saved to database successfully!', 
            user: result.rows[0] 
        });

    } catch (error) {
        console.error('Location Update Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const updateStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: 'Status cannot be empty' });

        const result = await db.query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING username, status',
            [status, userId]
        );

        res.json({ message: 'Status updated!', user: result.rows[0] });
    } catch (error) {
        console.error('Status Update Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getNearbyTravelers = async (req, res) => {
    try {
        const userId = req.user.id;
        const radiusInMeters = 5000000; // 500km

        const result = await db.query(
            `WITH current_user_loc AS (
                SELECT location FROM users WHERE id = $1
             )
             SELECT 
                users.id, 
                users.status,
                users.username, 
                ST_X(users.location::geometry) as lng, 
                ST_Y(users.location::geometry) as lat 
             FROM users, current_user_loc
             WHERE users.id != $1 
             AND users.location IS NOT NULL
             AND ST_DWithin(
                users.location::geography, 
                current_user_loc.location::geography, 
                $2
             )`,
            [userId, radiusInMeters]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Proximity Search Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { updateLocation, getNearbyTravelers, updateStatus };
