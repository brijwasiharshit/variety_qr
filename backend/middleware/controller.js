const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();


const controllerAuth = async (req, res, next) => {
  
  const { token } = req.cookies;  

  if (!token) {
    return res.status(401).json({ message: 'Invalid token, please login!' });
  }

  try {
    const tokenSecret = process.env.TOKEN_SECRET;
    const decodedToken = jwt.verify(token, tokenSecret);
    const { _id } = decodedToken;

    // Fetch the user from the database
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Optional: Check if the user is an admin (adjust according to your needs)
    if (user.role !== 'Controller') {
      return res.status(403).json({ message: 'Access denied. Controllers only.' });
    }

    // Add user to request object for later use
    req.user = user;

    // Move on to the next middleware/route handler
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token!' });
  }
};

module.exports = controllerAuth;
