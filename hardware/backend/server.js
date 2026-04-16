require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// --- NEW: Socket.IO Setup ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Allow your HTML page to connect
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL successfully'))
    .catch(err => console.error('Database connection error', err.stack));

// --- Socket.IO Connection Listener ---
io.on('connection', (socket) => {
    console.log('💻 Web Dashboard connected to live feed!');
});

// ==========================================
// 1. POSTMAN / WEB API: Register User
// ==========================================
app.post('/api/register', async (req, res) => {
    const { full_name, national_id, email, phone, device_code = 'esp32-01' } = req.body;

    if (!national_id || !full_name) {
        return res.status(400).json({ error: "full_name and national_id are required" });
    }

    try {
        await pool.query('BEGIN');
        let userId;
        const checkUser = await pool.query('SELECT id FROM users WHERE national_id = $1', [national_id]);

        if (checkUser.rows.length > 0) {
            userId = checkUser.rows[0].id;
        } else {
            const insertUser = `INSERT INTO users (full_name, national_id, email, phone, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id;`;
            const userResult = await pool.query(insertUser, [full_name, national_id, email, phone]);
            userId = userResult.rows[0].id;
        }

        const insertRequest = `INSERT INTO enrollment_requests (user_id, device_code, status, created_at) VALUES ($1, $2, 'pending', NOW()) RETURNING id;`;
        await pool.query(insertRequest, [userId, device_code]);
        await pool.query('COMMIT');

        
        io.emit('live_update', { type: 'info', message: `Scanner activated for ${full_name}. Waiting for finger...` });

        res.status(200).json({ success: true, message: "User registered.", user_id: userId });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Database error during registration" });
    }
});
app.get('/enrollment/next', async (req, res) => {
    const device_code = req.query.device_code || 'esp32-01';
    try {
        const query = `
            SELECT id AS request_id, user_id 
            FROM enrollment_requests 
            WHERE device_code = $1 AND status = 'pending' 
            ORDER BY created_at ASC LIMIT 1;
        `;
        const result = await pool.query(query, [device_code]);

        if (result.rows.length > 0) {
            res.status(200).json({ 
                status: "success", 
                request_id: result.rows[0].request_id, 
                user_id: result.rows[0].user_id 
            });
        } else {
            res.status(200).json({ status: "empty" });
        }
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});
// ==========================================
// 3. ESP32 API: Complete Enrollment
// ==========================================
app.post('/enrollment/complete', async (req, res) => {
    const { request_id, user_id, finger_id, device_code } = req.body;
    try {
        await pool.query('BEGIN');
        const insertFingerprint = `INSERT INTO fingerprints (user_id, finger_id, sensor_model, enrolled_at) VALUES ($1, $2, 'R307', NOW());`;
        await pool.query(insertFingerprint, [user_id, finger_id]);
        const updateRequest = `UPDATE enrollment_requests SET status = 'completed', completed_at = NOW() WHERE id = $1;`;
        await pool.query(updateRequest, [request_id]);
        await pool.query('COMMIT');

        // Broadcast to Dashboard!
        io.emit('live_update', { type: 'success', message: `✅ Fingerprint successfully saved for User ID ${user_id}!` });

        res.status(200).json({ success: true, message: "Enrollment fully completed" });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Failed to save fingerprint" });
    }
});

// ==========================================
// 4. ESP32 API: Verify Fingerprint
// ==========================================
app.post('/verify-fingerprint', async (req, res) => {
    const { finger_id } = req.body;
    if (!finger_id) return res.status(400).json({ error: "Missing finger_id" });

    try {
        const query = `
            SELECT u.id, u.full_name, u.national_id, u.email 
            FROM users u JOIN fingerprints f ON u.id = f.user_id WHERE f.finger_id = $1;
        `;
        const result = await pool.query(query, [finger_id]);

        if (result.rows.length === 0) {
            // Broadcast Failed Scan!
            io.emit('live_update', { type: 'error', message: `❌ Unknown fingerprint detected (ID: ${finger_id})` });
            return res.status(404).json({ success: false, message: "Fingerprint not found." });
        }

        const user = result.rows[0];

        io.emit('live_update', {
            type: 'verify',
            message: `🟢 Verified: ${user.full_name} has scanned in.`,
            user: user
        });
        res.status(200).json({ success: true, message: "User verified", user });
    } catch (err) {
        res.status(500).json({ error: "Database error during verification" });
    }
});

app.post('/api/vote', async (req, res) => {
    const { user_id, keypad_selection } = req.body;

    if (!user_id || !keypad_selection) {
        return res.status(400).json({ error: "Missing user_id or keypad selection" });
    }

    try {
        const candidateRes = await pool.query(
            'SELECT id, full_name FROM candidates WHERE keypad_number = $1', 
            [keypad_selection]
        );

        if (candidateRes.rows.length === 0) {
            return res.status(404).json({ error: "Invalid candidate number" });
        }

        const candidateId = candidateRes.rows[0].id;
        const candidateName = candidateRes.rows[0].full_name;

        await pool.query(
            'INSERT INTO votes (user_id, candidate_id) VALUES ($1, $2)',
            [user_id, candidateId]
        );

        io.emit('live_update', { 
            type: 'success', 
            message: `🗳️ Vote cast successfully for ${candidateName}!` 
        });

        res.status(200).json({ success: true, message: `Vote recorded for ${candidateName}` });

    } catch (err) {
        if (err.code === '23505') { 
            io.emit('live_update', { type: 'error', message: `❌ User ID ${user_id} already voted!` });
            return res.status(400).json({ error: "You have already voted!" });
        }
        console.error(err);
        res.status(500).json({ error: "Database error during voting" });
    }
});

// 6. API to get all candidates for your website display
app.get('/api/candidates', async (req, res) => {
    try {
        const result = await pool.query('SELECT keypad_number, full_name FROM candidates ORDER BY keypad_number ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch candidates" });
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
