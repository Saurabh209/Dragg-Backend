import { SystemDesignBoardModel } from './systemDesign.modal.js';
import { hashPassword, verifySystemDesignBoardAccess } from './systemDesign.middleware.js';
import { getLocalDB, saveLocalDB, isMongoConnected } from '../db.js';

export const handleGetAllSystemDesignBoards = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const boards = await SystemDesignBoardModel.find({}, '_id name createdAt updatedAt protectionMode preset').lean();
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
      const updated = await SystemDesignBoardModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updated) return res.status(404).json({ error: 'System design board not found' });
      return res.json({ ...updated, password: '' });
    }
    const db = await getLocalDB();
    const index = db.boards.findIndex(b => b._id === id);
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
    if (isMongoConnected()) {
      await SystemDesignBoardModel.findByIdAndDelete(id);
      return res.json({ success: true, id });
    }
    const db = await getLocalDB();
    db.boards = db.boards.filter(b => b._id !== id);
    await saveLocalDB(db);
    return res.json({ success: true, id });
  } catch (error) {
    console.error('Error in handleDeleteSystemDesignBoard:', error);
    res.status(500).json({ error: error.message });
  }
};
