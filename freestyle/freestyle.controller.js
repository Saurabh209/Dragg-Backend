import { FreestyleBoardModel } from './freestyle.modal.js';
import { hashPassword, verifyFreestyleBoardAccess } from './freestyle.middleware.js';
import { getLocalDB, saveLocalDB, isMongoConnected } from '../db.js';

export const handleGetAllFreestyleBoards = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const boards = await FreestyleBoardModel.find({}, '_id name createdAt updatedAt protectionMode preset').lean();
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
      const board = await FreestyleBoardModel.findById(id).lean();
      if (!board) return res.status(404).json({ error: 'Freestyle board not found' });
      const access = verifyFreestyleBoardAccess(board, providedPassword);
      if (!access.allowed && board.protectionMode === 'full') {
        return res.status(403).json({ error: 'Password required', protectionMode: 'full' });
      }
      if (!access.allowed && board.protectionMode === 'partial') {
        const sanitized = { ...board, password: '', cards: [], connections: [], drawings: [], code: '', isPartialProtected: true };
        return res.json(sanitized);
      }
      return res.json({ ...board, password: '' });
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
      const updated = await FreestyleBoardModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updated) return res.status(404).json({ error: 'Freestyle board not found' });
      return res.json({ ...updated, password: '' });
    }
    const db = await getLocalDB();
    const index = db.boards.findIndex(b => b._id === id);
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
    if (isMongoConnected()) {
      await FreestyleBoardModel.findByIdAndDelete(id);
      return res.json({ success: true, id });
    }
    const db = await getLocalDB();
    db.boards = db.boards.filter(b => b._id !== id);
    await saveLocalDB(db);
    return res.json({ success: true, id });
  } catch (error) {
    console.error('Error in handleDeleteFreestyleBoard:', error);
    res.status(500).json({ error: error.message });
  }
};
