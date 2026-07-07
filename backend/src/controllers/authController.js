import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    // Note: This is a placeholder structure for registering users.
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '24h' });
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully (Structure Mock)',
      data: {
        token,
        user: { name, email }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Mock verification
    const token = jwt.sign({ email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully (Structure Mock)',
      data: {
        token,
        user: { email }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
};
