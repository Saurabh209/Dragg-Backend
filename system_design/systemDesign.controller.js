import crypto from 'crypto';
import { SystemDesignBoardModel } from './systemDesign.modal.js';
import { BoardModel } from '../modal.js';
import { hashPassword, verifySystemDesignBoardAccess } from './systemDesign.middleware.js';
import { getLocalDB, saveLocalDB, isMongoConnected } from '../db.js';

export const handleGetAllSystemDesignBoards = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const boards = await SystemDesignBoardModel.find({}, '_id name createdAt updatedAt protectionMode preset').sort({ createdAt: -1 }).lean();
      return res.json(boards);
    }
    const db = await getLocalDB();
    const boards = (db.boards || [])
      .filter(b => b.preset === 'system_design')
      .map(b => ({
        _id: b._id,
        name: b.name,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        protectionMode: b.protectionMode || 'none',
        preset: 'system_design'
      }));
    return res.json(boards);
  } catch (error) {
    console.error('Error in handleGetAllSystemDesignBoards:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleGetSystemDesignBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const providedPassword = req.headers['x-board-password'] || '';

    if (isMongoConnected()) {
      const board = await SystemDesignBoardModel.findById(id).lean();
      if (!board) return res.status(404).json({ error: 'System design board not found' });
      const access = verifySystemDesignBoardAccess(board, providedPassword);
      if (!access.allowed && board.protectionMode === 'full') {
        return res.status(403).json({ error: 'Password required', protectionMode: 'full' });
      }
      return res.json({ ...board, password: '' });
    }

    const db = await getLocalDB();
    const board = (db.boards || []).find(b => b._id === id);
    if (!board) return res.status(404).json({ error: 'System design board not found' });
    const access = verifySystemDesignBoardAccess(board, providedPassword);
    if (!access.allowed && board.protectionMode === 'full') {
      return res.status(403).json({ error: 'Password required', protectionMode: 'full' });
    }
    return res.json({ ...board, password: '' });
  } catch (error) {
    console.error('Error in handleGetSystemDesignBoardById:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleCreateSystemDesignBoard = async (req, res) => {
  try {
    const { name, password, protectionMode } = req.body;
    const hashedPassword = password ? hashPassword(password) : '';
    const mode = protectionMode || (password ? 'full' : 'none');

    const customId = 'sd_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    if (isMongoConnected()) {
      const board = new SystemDesignBoardModel({
        _id: customId,
        name,
        password: hashedPassword,
        protectionMode: mode,
        preset: 'system_design',
        cards: [],
        connections: []
      });
      const saved = await board.save();
      return res.status(201).json({ ...saved.toObject(), password: '' });
    }

    const db = await getLocalDB();
    const newBoard = {
      _id: customId,
      name,
      password: hashedPassword,
      protectionMode: mode,
      preset: 'system_design',
      cards: [],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.boards = db.boards || [];
    db.boards.push(newBoard);
    await saveLocalDB(db);

    return res.status(201).json({ ...newBoard, password: '' });
  } catch (error) {
    console.error('Error in handleCreateSystemDesignBoard:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateSystemDesignBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (isMongoConnected()) {
      let updated = await SystemDesignBoardModel.findByIdAndUpdate(id, updateData, { new: true }).catch(() => null);
      if (!updated) updated = await SystemDesignBoardModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch(() => null);
      if (!updated) updated = await BoardModel.findByIdAndUpdate(id, updateData, { new: true }).catch(() => null);
      if (!updated) updated = await BoardModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch(() => null);
      if (!updated) return res.status(404).json({ error: 'System design board not found' });
      const boardObj = updated.toObject ? updated.toObject() : { ...updated };
      return res.json({ ...boardObj, password: '' });
    }
    const db = await getLocalDB();
    const index = db.boards.findIndex(b => String(b._id) === String(id));
    if (index === -1) return res.status(404).json({ error: 'Board not found' });
    db.boards[index] = { ...db.boards[index], ...updateData, updatedAt: new Date().toISOString() };
    await saveLocalDB(db);
    return res.json({ ...db.boards[index], password: '' });
  } catch (error) {
    console.error('Error in handleUpdateSystemDesignBoard:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteSystemDesignBoard = async (req, res) => {
  try {
    const { id } = req.params;
    let board;
    if (isMongoConnected()) {
      board = await SystemDesignBoardModel.findById(id).lean().catch(() => null);
      if (!board) board = await SystemDesignBoardModel.findOne({ _id: id }).lean().catch(() => null);
      if (!board) board = await BoardModel.findById(id).lean().catch(() => null);
      if (!board) board = await BoardModel.findOne({ _id: id }).lean().catch(() => null);
    } else {
      const db = await getLocalDB();
      board = (db.boards || []).find(b => String(b._id) === String(id));
    }
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (board.protectionMode === 'full' || board.protectionMode === 'partial') {
      const clientPassword = req.headers['x-board-password'];
      const salt = 'canvas-board-salt-1289';
      const sha256Hashed = crypto.createHash('sha256').update((clientPassword || '') + salt).digest('hex');
      const pbkdf2Hashed = crypto.pbkdf2Sync(clientPassword || '', salt, 1000, 64, 'sha512').toString('hex');
      const isOk = board.password === sha256Hashed || board.password === pbkdf2Hashed || clientPassword === board.password;
      if (!isOk) {
        return res.status(401).json({ error: 'Incorrect password. Board deletion denied.' });
      }
    }

    if (isMongoConnected()) {
      await SystemDesignBoardModel.findByIdAndDelete(id).catch(() => null);
      await SystemDesignBoardModel.findOneAndDelete({ _id: id }).catch(() => null);
      await BoardModel.findByIdAndDelete(id).catch(() => null);
      await BoardModel.findOneAndDelete({ _id: id }).catch(() => null);
      return res.json({ success: true, id });
    }
    const db = await getLocalDB();
    db.boards = (db.boards || []).filter(b => String(b._id) !== String(id));
    await saveLocalDB(db);
    return res.json({ success: true, id });
  } catch (error) {
    console.error('Error in handleDeleteSystemDesignBoard:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleVerifySystemDesignBoardPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    let board;
    if (isMongoConnected()) {
      board = await SystemDesignBoardModel.findById(id).lean().catch(() => null);
      if (!board) board = await SystemDesignBoardModel.findOne({ _id: id }).lean().catch(() => null);
      if (!board) board = await BoardModel.findById(id).lean().catch(() => null);
      if (!board) board = await BoardModel.findOne({ _id: id }).lean().catch(() => null);
    } else {
      const db = await getLocalDB();
      board = (db.boards || []).find(b => String(b._id) === String(id));
    }
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const access = verifySystemDesignBoardAccess(board, password);
    return res.json({ success: access.allowed, hashedPassword: access.allowed ? board.password : undefined });
  } catch (error) {
    console.error('Error verifying system design board password:', error);
    res.status(500).json({ error: 'Failed to verify password' });
  }
};
