const jwt = require('jsonwebtoken');

function getUserIdFromToken(token) {
    try {
        const secretKey = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secretKey);
        return decoded.userid; // Return the userid from the decoded token
    } catch (error) {
        // Handle token verification failure here
        console.error('Token verification failed:', error.message);
        return null; // Return null or handle the error based on your application's logic
    }
}

module.exports = getUserIdFromToken;
