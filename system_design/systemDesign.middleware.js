import crypto from 'crypto';

export function hashPassword(password) {
  if (!password) return '';
  const salt = 'sysdesign-board-salt-9941';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function validateSystemDesignBoardData(req, res, next) {
  if (req.method === 'POST') {
    if (!req.body.name || typeof req.body.name !== 'string') {
      return res.status(400).json({ error: 'System design board name is required' });
    }
  }
  next();
}

export function verifySystemDesignBoardAccess(board, providedPassword) {
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
