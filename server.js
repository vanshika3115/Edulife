require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());  // <-- Enable CORS for all origins (you can restrict this if needed)
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// In-memory user storage (replace with database in production)
let users = [];
// Try to load existing users from a JSON file
try {
    if (fs.existsSync('users.json')) {
        const data = fs.readFileSync('users.json', 'utf8');
        users = JSON.parse(data);
    }
} catch (err) {
    console.error('Error reading users file:', err);
}

// Configure email transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { fullName, email, password } = req.body;

    // Simple validation
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user (in production, hash the password before storing)
    const newUser = {
        id: Date.now().toString(),
        fullName,
        email,
        password, // In production, this should be hashed
        createdAt: new Date()
    };

    // Add user to array
    users.push(newUser);

    // Save users to file (simple persistence)
    try {
        fs.writeFileSync('users.json', JSON.stringify(users), 'utf8');
    } catch (err) {
        console.error('Error writing users file:', err);
    }

    // Send welcome email
    const mailOptions = {
        from: '"EduLife Team" <your-email@gmail.com>',
        to: email,
        subject: 'Welcome to EduLife Companion!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #1E3C72; text-align: center;">Welcome to EduLife Companion!</h2>
                <p>Dear ${fullName},</p>
                <p>Thank you for signing up with EduLife Companion. We're excited to have you join our community!</p>
                <p>With your new account, you can access all of our learning resources, track your progress, and connect with other learners.</p>
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/login.html" style="background-color: #FFD700; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
                </div>
                <p style="margin-top: 30px;">Best regards,<br>The EduLife Team</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            // We still register the user even if email fails
        } else {
            console.log('Email sent:', info.response);
        }
    });

    // Return success response
    res.status(201).json({ 
        message: 'Registration successful! A welcome email has been sent to your address.'
    });
});

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }]
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (err) {
        console.error('OpenAI error:', err);
        res.status(500).json({ reply: "Sorry, I couldn't process your request." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});