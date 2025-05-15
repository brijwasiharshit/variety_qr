const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const kitchenAuth = async (req, res, next) => {

  const {token} = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Invalid token, please login!' });
  }

  try {
    const tokenSecret = process.env.TOKEN_SECRET;
    const decodedToken = jwt.verify(token, tokenSecret);
    const { _id } = decodedToken;


    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (user.role !== 'Kitchen') {
      return res.status(403).json({ message: 'Access denied. Kitchen only.' });
    }

    
    req.user = user;


    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token!' });
  }
};

module.exports = kitchenAuth;
