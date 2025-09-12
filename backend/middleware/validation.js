// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation middleware for signup
export const validateSignup = (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Please provide a valid email address' 
    });
  }

  // Validate password length (minimum 7 characters)
  if (password.length < 7) {
    return res.status(400).json({ 
      error: 'Password must be at least 7 characters long' 
    });
  }

  next();
};

// Validation middleware for login
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  next();
};
