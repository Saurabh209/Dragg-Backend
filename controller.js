import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { BoardModel } from './modal.js';
import { FreestyleBoardModel } from './freestyle/freestyle.modal.js';
import { SystemDesignBoardModel } from './system_design/systemDesign.modal.js';
import { isLocalFallback } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'db.json');

// Helper for local JSON DB
const readLocalDB = async () => {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      await fs.promises.writeFile(LOCAL_DB_PATH, JSON.stringify({ boards: [] }, null, 2));
      return { boards: [] };
    }
    const data = await fs.promises.readFile(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local db:', err);
    return { boards: [] };
  }
};

const writeLocalDB = async (data) => {
  try {
    await fs.promises.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local db:', err);
  }
};

export const hashPassword = (password) => {
  if (!password) return '';
  const salt = 'canvas-board-salt-1289';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

export const verifyPassword = (password, hashedPassword) => {
  if (!password || !hashedPassword) return false;
  const salt = 'canvas-board-salt-1289';
  const sha256Hashed = crypto.createHash('sha256').update(password + salt).digest('hex');
  const pbkdf2Hashed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hashedPassword === sha256Hashed || hashedPassword === pbkdf2Hashed || password === hashedPassword;
};

// Data operations
export const getBoards = async () => {
  if (!isLocalFallback()) {
    const legacy = await BoardModel.find({}, 'name createdAt updatedAt zoom pan protectionMode preset cards.id cards.type connections.id drawings.tool').sort({ createdAt: -1 }).lean();
    const freestyle = await FreestyleBoardModel.find({}, 'name createdAt updatedAt zoom pan protectionMode preset cards.id cards.type connections.id drawings.tool').sort({ createdAt: -1 }).lean();
    const systemDesign = await SystemDesignBoardModel.find({}, 'name createdAt updatedAt zoom pan protectionMode preset cards.id cards.type connections.id drawings.tool').sort({ createdAt: -1 }).lean();
    const combined = [...legacy, ...freestyle, ...systemDesign];
    return combined.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
  } else {
    const db = await readLocalDB();
    return (db.boards || []).map(b => ({
      _id: b._id,
      name: b.name,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      zoom: b.zoom,
      pan: b.pan,
      protectionMode: b.protectionMode || 'none',
      preset: b.preset || 'freestyle',
      cards: (b.cards || []).map(c => ({ id: c.id, type: c.type })),
      connections: (b.connections || []).map(c => ({ id: c.id })),
      drawings: (b.drawings || []).map(d => ({ tool: d.tool }))
    })).sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
  }
};

export const getBoardById = async (id) => {
  if (!isLocalFallback()) {
    try {
      let board = await BoardModel.findById(id).catch(() => null);
      if (!board) board = await BoardModel.findOne({ _id: id }).catch(() => null);

      if (!board) board = await FreestyleBoardModel.findById(id).catch(() => null);
      if (!board) board = await FreestyleBoardModel.findOne({ _id: id }).catch(() => null);

      if (!board) board = await SystemDesignBoardModel.findById(id).catch(() => null);
      if (!board) board = await SystemDesignBoardModel.findOne({ _id: id }).catch(() => null);

      return board;
    } catch (err) {
      console.error('Error in getBoardById:', err);
      return null;
    }
  } else {
    const db = await readLocalDB();
    return db.boards.find(b => String(b._id) === String(id)) || null;
  }
};

export const createBoard = async (name, password = '', protectionMode = 'none', preset = 'freestyle') => {
  const hashedPassword = password ? hashPassword(password) : '';
  
  let initialCards = [];
  let initialConnections = [];

  if (preset === 'system_design') {
    initialCards = [
      {
        id: 'sys_fe',
        type: 'system_node',
        nodeType: 'frontend',
        title: 'Frontend Client',
        description: 'React Web / Mobile App',
        category: 'Surface',
        color: '#06b6d4',
        x: 60,
        y: 180,
        width: 220,
        height: 130,
        tags: ['Surface'],
        isConfigured: true,
        systemConfig: {}
      },
      {
        id: 'sys_gw',
        type: 'system_node',
        nodeType: 'api_gateway',
        title: 'API Gateway',
        description: 'Routes API traffic',
        category: 'Traffic',
        color: '#10b981',
        x: 360,
        y: 180,
        width: 220,
        height: 130,
        tags: ['Traffic'],
        isConfigured: true,
        systemConfig: {}
      },
      {
        id: 'sys_lb',
        type: 'system_node',
        nodeType: 'load_balancer',
        title: 'Load Balancer',
        description: 'Distributes incoming traffic',
        category: 'Traffic',
        color: '#10b981',
        x: 660,
        y: 180,
        width: 220,
        height: 130,
        tags: ['Traffic'],
        isConfigured: true,
        systemConfig: {
          layer: 'Layer 7',
          strategy: 'Round robin',
          healthChecks: 'Active',
          sessionAffinity: 'None',
          failover: 'Multi-zone'
        }
      },
      {
        id: 'sys_db',
        type: 'system_node',
        nodeType: 'database',
        title: 'Primary Database',
        description: 'PostgreSQL Relational DB',
        category: 'Data',
        color: '#3b82f6',
        x: 960,
        y: 100,
        width: 220,
        height: 130,
        tags: ['Data'],
        isConfigured: true,
        systemConfig: { dbEngine: 'PostgreSQL' }
      },
      {
        id: 'sys_cache',
        type: 'system_node',
        nodeType: 'cache',
        title: 'Redis Cache',
        description: 'In-memory Key-Value',
        category: 'Data',
        color: '#3b82f6',
        x: 960,
        y: 260,
        width: 220,
        height: 130,
        tags: ['Data'],
        isConfigured: true,
        systemConfig: { cacheEngine: 'Redis' }
      }
    ];

    initialConnections = [
      {
        id: 'conn_1',
        fromCardId: 'sys_fe',
        fromSide: 'right',
        toCardId: 'sys_gw',
        toSide: 'left',
        style: 'smooth-90',
        color: '#06b6d4',
        thickness: 2.5
      },
      {
        id: 'conn_2',
        fromCardId: 'sys_gw',
        fromSide: 'right',
        toCardId: 'sys_lb',
        toSide: 'left',
        style: 'smooth-90',
        color: '#10b981',
        thickness: 2.5
      },
      {
        id: 'conn_3',
        fromCardId: 'sys_lb',
        fromSide: 'right',
        toCardId: 'sys_db',
        toSide: 'left',
        style: 'smooth-90',
        color: '#3b82f6',
        thickness: 2.5
      },
      {
        id: 'conn_4',
        fromCardId: 'sys_lb',
        fromSide: 'right',
        toCardId: 'sys_cache',
        toSide: 'left',
        style: 'smooth-90',
        color: '#3b82f6',
        thickness: 2.5
      }
    ];
  }

  if (!isLocalFallback()) {
    const board = new BoardModel({
      name,
      password: hashedPassword,
      protectionMode,
      preset,
      cards: initialCards,
      connections: initialConnections
    });
    return await board.save();
  } else {
    const db = await readLocalDB();
    const newBoard = {
      _id: Math.random().toString(36).substring(2, 11),
      name,
      password: hashedPassword,
      protectionMode,
      preset,
      cards: initialCards,
      connections: initialConnections,
      drawings: [],
      pan: { x: 0, y: 0 },
      zoom: 1,
      boardBgColor: '#0a0a0c',
      liveBgStyle: 'none',
      toolbarSettings: { position: { x: 20, y: 200 }, orientation: 'vertical' },
      stylePresets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.boards.push(newBoard);
    await writeLocalDB(db);
    return newBoard;
  }
};

export const updateBoard = async (id, data) => {
  if (!isLocalFallback()) {
    const updateFields = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.cards !== undefined) updateFields.cards = data.cards;
    if (data.connections !== undefined) updateFields.connections = data.connections;
    if (data.drawings !== undefined) updateFields.drawings = data.drawings;
    if (data.pan !== undefined) updateFields.pan = data.pan;
    if (data.zoom !== undefined) updateFields.zoom = data.zoom;
    if (data.code !== undefined) updateFields.code = data.code;
    if (data.language !== undefined) updateFields.language = data.language;
    if (data.highlightedPathStartCardId !== undefined) updateFields.highlightedPathStartCardId = data.highlightedPathStartCardId;
    if (data.boardBgColor !== undefined) updateFields.boardBgColor = data.boardBgColor;
    if (data.liveBgStyle !== undefined) updateFields.liveBgStyle = data.liveBgStyle;
    if (data.toolbarSettings !== undefined) updateFields.toolbarSettings = data.toolbarSettings;
    if (data.stylePresets !== undefined) updateFields.stylePresets = data.stylePresets;

    let updated = await BoardModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).catch(() => null);
    if (!updated) updated = await BoardModel.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true }).catch(() => null);
    if (!updated) updated = await FreestyleBoardModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).catch(() => null);
    if (!updated) updated = await FreestyleBoardModel.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true }).catch(() => null);
    if (!updated) updated = await SystemDesignBoardModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).catch(() => null);
    if (!updated) updated = await SystemDesignBoardModel.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true }).catch(() => null);
    return updated;
  } else {
    const db = await readLocalDB();
    const index = db.boards.findIndex(b => String(b._id) === String(id));
    if (index === -1) return null;
    db.boards[index] = {
      ...db.boards[index],
      name: data.name !== undefined ? data.name : db.boards[index].name,
      cards: data.cards !== undefined ? data.cards : db.boards[index].cards,
      connections: data.connections !== undefined ? data.connections : db.boards[index].connections,
      drawings: data.drawings !== undefined ? data.drawings : db.boards[index].drawings,
      pan: data.pan !== undefined ? data.pan : db.boards[index].pan,
      zoom: data.zoom !== undefined ? data.zoom : db.boards[index].zoom,
      code: data.code !== undefined ? data.code : db.boards[index].code,
      language: data.language !== undefined ? data.language : db.boards[index].language,
      highlightedPathStartCardId: data.highlightedPathStartCardId !== undefined ? data.highlightedPathStartCardId : db.boards[index].highlightedPathStartCardId,
      boardBgColor: data.boardBgColor !== undefined ? data.boardBgColor : db.boards[index].boardBgColor,
      liveBgStyle: data.liveBgStyle !== undefined ? data.liveBgStyle : db.boards[index].liveBgStyle,
      toolbarSettings: data.toolbarSettings !== undefined ? data.toolbarSettings : db.boards[index].toolbarSettings,
      stylePresets: data.stylePresets !== undefined ? data.stylePresets : db.boards[index].stylePresets,
      updatedAt: new Date().toISOString()
    };
    await writeLocalDB(db);
    return db.boards[index];
  }
};

export const patchBoard = async (id, delta) => {
  if (!isLocalFallback()) {
    let existingBoard = await BoardModel.findById(id).catch(() => null);
    if (!existingBoard) existingBoard = await BoardModel.findOne({ _id: id }).catch(() => null);
    let ModelToUpdate = BoardModel;

    if (!existingBoard) {
      existingBoard = await FreestyleBoardModel.findById(id).catch(() => null);
      if (!existingBoard) existingBoard = await FreestyleBoardModel.findOne({ _id: id }).catch(() => null);
      ModelToUpdate = FreestyleBoardModel;
    }
    if (!existingBoard) {
      existingBoard = await SystemDesignBoardModel.findById(id).catch(() => null);
      if (!existingBoard) existingBoard = await SystemDesignBoardModel.findOne({ _id: id }).catch(() => null);
      ModelToUpdate = SystemDesignBoardModel;
    }
    if (!existingBoard) return null;

    const currentCards = existingBoard.cards || [];
    const cardMap = new Map();
    currentCards.forEach(c => {
      const obj = c.toObject ? c.toObject() : c;
      if (obj && obj.id) cardMap.set(obj.id, obj);
    });

    if (Array.isArray(delta.deletedCardIds)) {
      delta.deletedCardIds.forEach(cardId => cardMap.delete(cardId));
    }

    if (Array.isArray(delta.updatedCards)) {
      delta.updatedCards.forEach(card => {
        if (card && card.id) {
          const existing = cardMap.get(card.id) || {};
          cardMap.set(card.id, { ...existing, ...card });
        }
      });
    }

    const updateFields = { updatedAt: new Date().toISOString() };
    if (delta.updatedCards !== undefined || delta.deletedCardIds !== undefined) {
      updateFields.cards = Array.from(cardMap.values());
    } else if (delta.cards !== undefined) {
      updateFields.cards = delta.cards;
    }

    if (delta.updatedConnections !== undefined) {
      updateFields.connections = delta.updatedConnections;
    } else if (delta.connections !== undefined) {
      updateFields.connections = delta.connections;
    }

    if (delta.updatedDrawings !== undefined) {
      updateFields.drawings = delta.updatedDrawings;
    } else if (delta.drawings !== undefined) {
      updateFields.drawings = delta.drawings;
    }

    if (delta.name !== undefined) updateFields.name = delta.name;
    if (delta.pan !== undefined) updateFields.pan = delta.pan;
    if (delta.zoom !== undefined) updateFields.zoom = delta.zoom;
    if (delta.code !== undefined) updateFields.code = delta.code;
    if (delta.language !== undefined) updateFields.language = delta.language;
    if (delta.highlightedPathStartCardId !== undefined) updateFields.highlightedPathStartCardId = delta.highlightedPathStartCardId;
    if (delta.boardBgColor !== undefined) updateFields.boardBgColor = delta.boardBgColor;
    if (delta.liveBgStyle !== undefined) updateFields.liveBgStyle = delta.liveBgStyle;
    if (delta.toolbarSettings !== undefined) updateFields.toolbarSettings = delta.toolbarSettings;
    if (delta.stylePresets !== undefined) updateFields.stylePresets = delta.stylePresets;

    return await ModelToUpdate.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );
  } else {
    const db = await readLocalDB();
    const index = db.boards.findIndex(b => b._id === id);
    if (index === -1) return null;

    const board = db.boards[index];
    const cardMap = new Map();
    (board.cards || []).forEach(c => {
      if (c && c.id) cardMap.set(c.id, { ...c });
    });

    if (Array.isArray(delta.deletedCardIds)) {
      delta.deletedCardIds.forEach(cardId => cardMap.delete(cardId));
    }

    if (Array.isArray(delta.updatedCards)) {
      delta.updatedCards.forEach(card => {
        if (card && card.id) {
          const existing = cardMap.get(card.id) || {};
          cardMap.set(card.id, { ...existing, ...card });
        }
      });
    }

    let finalCards = board.cards;
    if (delta.updatedCards !== undefined || delta.deletedCardIds !== undefined) {
      finalCards = Array.from(cardMap.values());
    } else if (delta.cards !== undefined) {
      finalCards = delta.cards;
    }

    let finalConnections = delta.updatedConnections !== undefined ? delta.updatedConnections : (delta.connections !== undefined ? delta.connections : board.connections);
    let finalDrawings = delta.updatedDrawings !== undefined ? delta.updatedDrawings : (delta.drawings !== undefined ? delta.drawings : board.drawings);

    db.boards[index] = {
      ...board,
      name: delta.name !== undefined ? delta.name : board.name,
      cards: finalCards,
      connections: finalConnections,
      drawings: finalDrawings,
      pan: delta.pan !== undefined ? delta.pan : board.pan,
      zoom: delta.zoom !== undefined ? delta.zoom : board.zoom,
      code: delta.code !== undefined ? delta.code : board.code,
      language: delta.language !== undefined ? delta.language : board.language,
      highlightedPathStartCardId: delta.highlightedPathStartCardId !== undefined ? delta.highlightedPathStartCardId : board.highlightedPathStartCardId,
      boardBgColor: delta.boardBgColor !== undefined ? delta.boardBgColor : board.boardBgColor,
      liveBgStyle: delta.liveBgStyle !== undefined ? delta.liveBgStyle : board.liveBgStyle,
      toolbarSettings: delta.toolbarSettings !== undefined ? delta.toolbarSettings : board.toolbarSettings,
      stylePresets: delta.stylePresets !== undefined ? delta.stylePresets : board.stylePresets,
      updatedAt: new Date().toISOString()
    };

    await writeLocalDB(db);
    return db.boards[index];
  }
};

export const deleteBoard = async (id) => {
  if (!isLocalFallback()) {
    let deleted = await BoardModel.findByIdAndDelete(id);
    if (!deleted) deleted = await FreestyleBoardModel.findByIdAndDelete(id);
    if (!deleted) deleted = await SystemDesignBoardModel.findByIdAndDelete(id);
    return deleted;
  } else {
    const db = await readLocalDB();
    const index = db.boards.findIndex(b => b._id === id);
    if (index === -1) return null;
    const deleted = db.boards.splice(index, 1)[0];
    await writeLocalDB(db);
    return deleted;
  }
};

// Express Route Controllers
export const handleGetAllBoards = async (req, res) => {
  try {
    const boards = await getBoards();
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
};

export const handleVerifyPassword = async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const { password } = req.body;
    const isCorrect = verifyPassword(password, board.password);
    res.json({ success: isCorrect, hashedPassword: isCorrect ? board.password : undefined });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Failed to verify password' });
  }
};

export const handleGetBoardById = async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const clientPassword = req.headers['x-board-password'];

    // Check protection mode
    if (board.protectionMode === 'full') {
      if (!verifyPassword(clientPassword, board.password)) {
        return res.status(401).json({ error: 'Password required' });
      }
    }

    const boardData = board.toObject ? board.toObject() : { ...board };
    
    // Partial protection mode marks isPartialProtected flag if password not provided
    if (board.protectionMode === 'partial' && !verifyPassword(clientPassword, board.password)) {
      boardData.isPartialProtected = true;
    }

    delete boardData.password;
    res.json(boardData);
  } catch (error) {
    console.error('Error fetching board details:', error);
    res.status(500).json({ error: 'Failed to fetch board details' });
  }
};

export const handleCreateBoard = async (req, res) => {
  try {
    const { name, password, protectionMode, preset } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const newBoard = await createBoard(name.trim(), password, protectionMode, preset);
    const boardData = newBoard.toObject ? newBoard.toObject() : { ...newBoard };
    delete boardData.password;

    res.status(201).json(boardData);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
};

export const handleUpdateBoard = async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.protectionMode === 'full' || board.protectionMode === 'partial') {
      const clientPassword = req.headers['x-board-password'];
      if (!verifyPassword(clientPassword, board.password)) {
        return res.status(401).json({ error: 'Password required to update board' });
      }
    }

    const updatedBoard = await updateBoard(req.params.id, req.body);
    const boardData = updatedBoard.toObject ? updatedBoard.toObject() : { ...updatedBoard };
    delete boardData.password;

    res.json(boardData);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
};

export const handlePatchBoard = async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.protectionMode === 'full' || board.protectionMode === 'partial') {
      const clientPassword = req.headers['x-board-password'];
      if (!verifyPassword(clientPassword, board.password)) {
        return res.status(401).json({ error: 'Password required to update board' });
      }
    }

    const patchedBoard = await patchBoard(req.params.id, req.body);
    if (!patchedBoard) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const boardData = patchedBoard.toObject ? patchedBoard.toObject() : { ...patchedBoard };
    delete boardData.password;

    res.json(boardData);
  } catch (error) {
    console.error('Error patching board:', error);
    res.status(500).json({ error: 'Failed to patch board' });
  }
};

export const handleDeleteBoard = async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.protectionMode === 'full' || board.protectionMode === 'partial') {
      const clientPassword = req.headers['x-board-password'];
      if (!verifyPassword(clientPassword, board.password)) {
        return res.status(401).json({ error: 'Password required to delete board' });
      }
    }

    const deletedBoard = await deleteBoard(req.params.id);
    if (!deletedBoard) {
      return res.status(404).json({ error: 'Board not found during deletion' });
    }
    
    const boardData = deletedBoard.toObject ? deletedBoard.toObject() : { ...deletedBoard };
    delete boardData.password;

    res.json({ message: 'Board deleted successfully', board: boardData });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
};
