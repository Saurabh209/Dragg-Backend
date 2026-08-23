import crypto from 'crypto';

export function hashPassword(password) {
  if (!password) return '';
  const salt = 'canvas-board-salt-1289';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function validateFreestyleBoardData(req, res, next) {
  if (req.method === 'POST') {
    if (!req.body.name || typeof req.body.name !== 'string') {
      return res.status(400).json({ error: 'Freestyle board name is required and must be a string' });
    }
  }
  next();
}

export function verifyFreestyleBoardAccess(board, providedPassword) {
  if (!board) return { allowed: false, reason: 'Board not found' };
  if (!board.password || board.protectionMode === 'none') {
    return { allowed: true };
  }
  if (!providedPassword) return { allowed: false, reason: 'Password required' };

  const salt = 'canvas-board-salt-1289';
  const sha256Hashed = crypto.createHash('sha256').update(providedPassword + salt).digest('hex');
  const pbkdf2Hashed = crypto.pbkdf2Sync(providedPassword, salt, 1000, 64, 'sha512').toString('hex');

  if (board.password === sha256Hashed || board.password === pbkdf2Hashed || providedPassword === board.password) {
    return { allowed: true };
  }
  return { allowed: false, reason: 'Invalid password' };
}
