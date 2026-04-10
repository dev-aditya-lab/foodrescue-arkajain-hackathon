import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header) return _res.status(401).json({ message: 'Missing Authorization header' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return _res.status(401).json({ message: 'Invalid token' });
  }
};
