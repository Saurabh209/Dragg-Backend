import crypto from 'crypto';

export function hashPassword(password) {
  if (!password) return '';
  const salt = 'canvas-board-salt-1289';
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
  if (!providedPassword) return { allowed: false, reason: 'Password required' };

  if (providedPassword === board.password) {
    return { allowed: true };
  }

  const salt = 'canvas-board-salt-1289';
  const sha256Hashed = crypto.createHash('sha256').update(providedPassword + salt).digest('hex');
  if (board.password === sha256Hashed) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Invalid password' };
}
