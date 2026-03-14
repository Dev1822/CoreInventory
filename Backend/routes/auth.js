const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Otp = require('../models/Otp');
const generateOtp = require('../utils/generateOtp');
const sendOtpEmail = require('../utils/sendEmail');

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+={}[\]:;"'<>,.?/\\|`~]).{8,}$/;

// ────────────────────────────────────────
//  POST /api/auth/signup
// ────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { loginId, email, password, confirmPassword } = req.body;

        if (!loginId || !email || !password || !confirmPassword)
            return res.status(400).json({ message: 'All fields are required' });

        if (loginId.length < 6 || loginId.length > 12)
            return res.status(400).json({ message: 'Login ID must be 6–12 characters' });

        if (!PASSWORD_RE.test(password))
            return res.status(400).json({
                message: 'Password must be 8+ chars with uppercase, lowercase & special character',
            });

        if (password !== confirmPassword)
            return res.status(400).json({ message: 'Passwords do not match' });

        // duplicate checks
        const idTaken = await User.findOne({ loginId, email: { $ne: email } });
        if (idTaken && idTaken.isVerified)
            return res.status(409).json({ message: 'Login ID already taken' });

        const existing = await User.findOne({ email });
        if (existing && existing.isVerified)
            return res.status(409).json({ message: 'Account already exists. Please sign in.' });

        const hash = await bcrypt.hash(password, 12);

        if (existing && !existing.isVerified) {
            existing.loginId = loginId;
            existing.password = hash;
            await existing.save();
        } else {
            await User.create({ loginId, email, password: hash });
        }

        await Otp.deleteMany({ email });
        const otp = generateOtp();
        await Otp.create({ email, otp });
        await sendOtpEmail(email, otp);

        res.status(201).json({ message: 'OTP sent to your email.', email });
    } catch (err) {
        console.error('signup:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────
//  POST /api/auth/verify-otp
// ────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ message: 'Email and OTP are required' });

        const record = await Otp.findOne({ email, otp });
        if (!record)
            return res.status(400).json({ message: 'Invalid or expired OTP' });

        await User.updateOne({ email }, { isVerified: true });
        await Otp.deleteMany({ email });

        const user = await User.findOne({ email });
        const token = jwt.sign(
            { userId: user._id, loginId: user.loginId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
        );

        res.json({ message: 'Email verified', token, user: { loginId: user.loginId, email: user.email } });
    } catch (err) {
        console.error('verify-otp:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────
//  POST /api/auth/login  (direct — no OTP)
// ────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { loginId, password } = req.body;
        if (!loginId || !password)
            return res.status(400).json({ message: 'All fields are required' });

        const user = await User.findOne({ loginId });
        if (!user)
            return res.status(401).json({ message: 'Invalid Login ID or Password' });

        if (!user.isVerified)
            return res.status(403).json({ message: 'Email not verified. Please sign up again.' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ message: 'Invalid Login ID or Password' });

        const token = jwt.sign(
            { userId: user._id, loginId: user.loginId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
        );

        res.json({ message: 'Login successful', token, user: { loginId: user.loginId, email: user.email } });
    } catch (err) {
        console.error('login:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────
//  POST /api/auth/forgot-password
// ────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email, isVerified: true });
        if (!user)
            return res.status(404).json({ message: 'No verified account with that email' });

        await Otp.deleteMany({ email });
        const otp = generateOtp();
        await Otp.create({ email, otp });
        await sendOtpEmail(email, otp);

        res.json({ message: 'OTP sent to your email', email });
    } catch (err) {
        console.error('forgot-password:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────
//  POST /api/auth/reset-password
// ────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword)
            return res.status(400).json({ message: 'All fields are required' });

        if (!PASSWORD_RE.test(newPassword))
            return res.status(400).json({
                message: 'Password must be 8+ chars with uppercase, lowercase & special character',
            });

        if (newPassword !== confirmPassword)
            return res.status(400).json({ message: 'Passwords do not match' });

        const record = await Otp.findOne({ email, otp });
        if (!record)
            return res.status(400).json({ message: 'Invalid or expired OTP' });

        const hash = await bcrypt.hash(newPassword, 12);
        await User.updateOne({ email }, { password: hash });
        await Otp.deleteMany({ email });

        res.json({ message: 'Password reset successfully. Please sign in.' });
    } catch (err) {
        console.error('reset-password:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────
//  POST /api/auth/resend-otp
// ────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        await Otp.deleteMany({ email });
        const otp = generateOtp();
        await Otp.create({ email, otp });
        await sendOtpEmail(email, otp);

        res.json({ message: 'New OTP sent' });
    } catch (err) {
        console.error('resend-otp:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
