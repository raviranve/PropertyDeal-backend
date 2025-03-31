const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// Middleware to verify access token
const accessTokenVerify = async (req, res, next) => {
  const token = req.cookies.accessToken; // Adjusted to match the cookie name

  if (!token) {
    return res.status(401).json({
      status: 'failed',
      message: 'Access token not provided.',
      error: { message: 'Access token not found' },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'failed',
        message: 'User not found.',
        error: { message: 'Invalid token' },
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Access token expired.',
        error: { message: 'Token expired' },
      });
    }
    res.status(400).json({
      status: 'failed',
      message: 'Invalid token.',
      error: { message: 'Token not valid' },
    });
  }
};

// Middleware to verify refresh token and issue new tokens
const refreshTokenVerify = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({
      status: 'failed',
      message: 'Refresh token not provided.',
      error: { message: 'Refresh token not found' },
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if the refresh token exists in the database
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.id,
    });
    if (!storedToken) {
      return res.status(403).json({
        status: 'failed',
        message: 'Invalid refresh token.',
        error: { message: 'Token not valid' },
      });
    }

    // Generate new tokens
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'failed',
        message: 'User not found.',
        error: { message: 'Invalid token' },
      });
    }
    const { accessToken, refreshToken: newRefreshToken } = user.generateAuthToken();

    // Replace old refresh token with the new one in the database
    storedToken.token = newRefreshToken;
    storedToken.expiresAt =  7 * 24 * 60 * 60 * 1000;
    await storedToken.save();

    // Set new tokens in HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: 'success',
      message: 'Access token refreshed successfully',
    });
  } catch (error) {
    res.status(403).json({
      status: 'failed',
      message: 'Invalid or expired refresh token',
      error: { message: error.message },
    });
  }
};

// Role-Based Authorization Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'failed',
        message: `Access denied. Required role: ${roles.join(', ')}`,
        error: { message: 'Access denied for this user' },
      });
    }
    next();
  };
};

module.exports = { accessTokenVerify, refreshTokenVerify, authorizeRoles };
