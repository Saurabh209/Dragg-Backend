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
  const hashed = hashPassword(providedPassword);
  if (board.password === hashed) {
    return { allowed: true };
  }
  return { allowed: false, reason: 'Invalid password' };
}
