import { FreestyleBoardModel } from './freestyle.modal.js';
import { BoardModel } from '../modal.js';
import { hashPassword, verifyFreestyleBoardAccess } from './freestyle.middleware.js';
import { getLocalDB, saveLocalDB, isMongoConnected } from '../db.js';

export const handleGetAllFreestyleBoards = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const boards = await FreestyleBoardModel.find({}, '_id name createdAt updatedAt protectionMode preset').sort({ createdAt: -1 }).lean();
      return res.json(boards);
    }
    const db = await getLocalDB();
    const boards = (db.boards || [])
      .filter(b => b.preset === 'freestyle' || !b.preset)
      .map(b => ({
        _id: b._id,
        name: b.name,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        protectionMode: b.protectionMode || 'none',
        preset: 'freestyle'
      }));
    return res.json(boards);
  } catch (error) {
    console.error('Error in handleGetAllFreestyleBoards:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleGetFreestyleBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const providedPassword = req.headers['x-board-password'] || '';

    if (isMongoConnected()) {
      let board = await FreestyleBoardModel.findById(id).lean();
      if (!board) board = await FreestyleBoardModel.findOne({ _id: id }).lean();
      if (!board) board = await BoardModel.findById(id).lean();
      if (!board) board = await BoardModel.findOne({ _id: id }).lean();
      if (!board) return res.status(404).json({ error: 'Freestyle board not found' });
      const access = verifyFreestyleBoardAccess(board, providedPassword);
      if (!access.allowed && board.protectionMode === 'full') {
        return res.status(403).json({ error: 'Password required', protectionMode: 'full' });
      }

      const formattedCards = (board.cards || []).map(c => ({
        ...c,
        id: c.id || (c._id ? String(c._id) : 'card_' + Math.random().toString(36).substring(2, 9))
      }));

      if (!access.allowed && board.protectionMode === 'partial') {
        const sanitized = { ...board, password: '', cards: [], connections: [], drawings: [], code: '', isPartialProtected: true };
        return res.json(sanitized);
      }
      return res.json({ ...board, cards: formattedCards, password: '' });
    }

    const db = await getLocalDB();
    const board = (db.boards || []).find(b => b._id === id);
    if (!board) return res.status(404).json({ error: 'Freestyle board not found' });
    const access = verifyFreestyleBoardAccess(board, providedPassword);
    if (!access.allowed && board.protectionMode === 'full') {
      return res.status(403).json({ error: 'Password required', protectionMode: 'full' });
    }
    return res.json({ ...board, password: '' });
  } catch (error) {
    console.error('Error in handleGetFreestyleBoardById:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleCreateFreestyleBoard = async (req, res) => {
  try {
    const { name, password, protectionMode } = req.body;
    const hashedPassword = password ? hashPassword(password) : '';
    const mode = protectionMode || (password ? 'full' : 'none');

    const customId = 'fs_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    if (isMongoConnected()) {
      const board = new FreestyleBoardModel({
        _id: customId,
        name,
        password: hashedPassword,
        protectionMode: mode,
        preset: 'freestyle',
        cards: [],
        connections: [],
        drawings: []
      });
      const saved = await board.save();
      return res.status(201).json({ ...saved.toObject(), password: '' });
    }

    const db = await getLocalDB();
    const newBoard = {
      _id: 'fs_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name,
      password: hashedPassword,
      protectionMode: mode,
      preset: 'freestyle',
      cards: [],
      connections: [],
      drawings: [],
      pan: { x: 0, y: 0 },
      zoom: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.boards.push(newBoard);
    await saveLocalDB(db);
    return res.status(201).json({ ...newBoard, password: '' });
  } catch (error) {
    console.error('Error in handleCreateFreestyleBoard:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateFreestyleBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (isMongoConnected()) {
      let updated = await FreestyleBoardModel.findByIdAndUpdate(id, updateData, { new: true }).catch(() => null);
      if (!updated) updated = await FreestyleBoardModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch(() => null);
      if (!updated) updated = await BoardModel.findByIdAndUpdate(id, updateData, { new: true }).catch(() => null);
      if (!updated) updated = await BoardModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch(() => null);
      if (!updated) return res.status(404).json({ error: 'Freestyle board not found' });
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
    console.error('Error in handleUpdateFreestyleBoard:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteFreestyleBoard = async (req, res) => {
  try {
    const { id } = req.params;
    let board;
    if (isMongoConnected()) {
      board = await FreestyleBoardModel.findById(id).lean().catch(() => null);
      if (!board) board = await FreestyleBoardModel.findOne({ _id: id }).lean().catch(() => null);
      if (!board) board = await BoardModel.findById(id).lean().catch(() => null);
      if (!board) board = await BoardModel.findOne({ _id: id }).lean().catch(() => null);
    } else {
      const db = await getLocalDB();
      board = (db.boards || []).find(b => String(b._id) === String(id));
    }
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (board.protectionMode === 'full' || board.protectionMode === 'partial') {
      const clientPassword = req.headers['x-board-password'];
      const access = verifyFreestyleBoardAccess(board, clientPassword);
      if (!access.allowed) {
        return res.status(401).json({ error: 'Incorrect password. Board deletion denied.' });
      }
    }

    if (isMongoConnected()) {
      await FreestyleBoardModel.findByIdAndDelete(id).catch(() => null);
      await FreestyleBoardModel.findOneAndDelete({ _id: id }).catch(() => null);
      await BoardModel.findByIdAndDelete(id).catch(() => null);
      await BoardModel.findOneAndDelete({ _id: id }).catch(() => null);
      return res.json({ success: true, id });
    }
    const db = await getLocalDB();
    db.boards = (db.boards || []).filter(b => String(b._id) !== String(id));
    await saveLocalDB(db);
    return res.json({ success: true, id });
  } catch (error) {
    console.error('Error in handleDeleteFreestyleBoard:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleVerifyFreestyleBoardPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    let board;
    if (isMongoConnected()) {
      board = await FreestyleBoardModel.findById(id).lean();
      if (!board) board = await FreestyleBoardModel.findOne({ _id: id }).lean();
    } else {
      const db = await getLocalDB();
      board = (db.boards || []).find(b => String(b._id) === String(id));
    }
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const access = verifyFreestyleBoardAccess(board, password);
    return res.json({ success: access.allowed, hashedPassword: access.allowed ? board.password : undefined });
  } catch (error) {
    console.error('Error verifying freestyle board password:', error);
    res.status(500).json({ error: 'Failed to verify password' });
  }
};
