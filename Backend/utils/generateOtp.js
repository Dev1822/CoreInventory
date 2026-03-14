/**
 * Generate a random 6-digit OTP
 */
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = generateOtp;
