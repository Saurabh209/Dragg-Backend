import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'db.json');

let useLocal = false;

const AttachmentSchema = new mongoose.Schema({
  name: String,
  mimeType: String,
  size: Number,
  dataUrl: String
});

const CardFeaturesSchema = new mongoose.Schema({
  notes: { type: Boolean, default: true },
  sketch: { type: Boolean, default: true },
  attachments: { type: Boolean, default: true },
  tags: { type: Boolean, default: true },
  colorPalette: { type: Boolean, default: true },
  completedStatus: { type: Boolean, default: true },
  connectPorts: { type: Boolean, default: true }
}, { _id: false });

const CardSchema = new mongoose.Schema({
  id: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  title: String,
  content: String,
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  tags: [String],
  color: String,
  type: { type: String, default: 'note' }, // 'note' | 'image'
  imageUrl: { type: String, default: '' },
  drawingDataUrl: { type: String, default: '' },
  cardMode: { type: String, default: 'notes' }, // 'notes' | 'code' | 'sketch'
  attachments: { type: [AttachmentSchema], default: [] },
  completed: { type: Boolean, default: false },
  isStartNode: { type: Boolean, default: false },
  showInSearch: { type: Boolean, default: false },
  groupId: { type: String, default: '' },
  isLocked: { type: Boolean, default: false },
  badge: {
    text: { type: String, default: '' },
    color: { type: String, default: '' }
  },
  notesFontSize: { type: String, default: 'medium' },
  notesTextColor: { type: String, default: 'default' },
  notesFontFamily: { type: String, default: 'sans' },
  notesFontWeight: { type: String, default: 'normal' },
  notesFontStyle: { type: String, default: 'normal' },
  features: { type: CardFeaturesSchema, default: () => ({ notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }) },
  nodeLayout: { type: String, default: 'four-node' } // 'four-node' | 'freestyle'
});

const ConnectionSchema = new mongoose.Schema({
  id: String,
  fromCardId: String,
  fromSide: { type: String, default: 'right' },
  toCardId: String,
  toSide: { type: String, default: 'left' },
  label: String,
  style: { type: String, default: 'default' },
  color: { type: String },
  animation: { type: String, default: 'none' },
  thickness: { type: Number, default: 2.5 },
  fromOffsetX: Number,
  fromOffsetY: Number,
  toOffsetX: Number,
  toOffsetY: Number
});

const StrokePointSchema = new mongoose.Schema({
  x: Number,
  y: Number
}, { _id: false });

const StrokeSchema = new mongoose.Schema({
  tool: String,
  color: String,
  thickness: Number,
  points: [StrokePointSchema]
}, { _id: false });

const BoardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, default: '' },
  protectionMode: { type: String, enum: ['none', 'full', 'partial'], default: 'none' },
  preset: { type: String, enum: ['freestyle', 'system_design'], default: 'freestyle' },
  cards: { type: [CardSchema], default: [] },
  connections: { type: [ConnectionSchema], default: [] },
  drawings: { type: [StrokeSchema], default: [] },
  pan: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  zoom: { type: Number, default: 1 },
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  highlightedPathStartCardId: { type: String, default: '' },
  boardBgColor: { type: String, default: '#0a0a0c' },
  liveBgStyle: { type: String, default: 'none' },
  toolbarSettings: {
    position: {
      x: { type: Number, default: 20 },
      y: { type: Number, default: 200 }
    },
    orientation: { type: String, enum: ['vertical', 'horizontal'], default: 'vertical' }
  },
  stylePresets: {
    type: [{
      id: String,
      key: String,
      name: String,
      toolMode: String,
      connectorStyle: String,
      connectorAnimation: String,
      connectorColor: String,
      connectorThickness: Number,
      penColor: String,
      penThickness: Number
    }],
    default: []
  }
}, { timestamps: true });

const BoardModel = mongoose.model('Board', BoardSchema);

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

export const connectDB = async (mongoUri) => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Timeout after 3 seconds
    });
    console.log('Successfully connected to MongoDB!');
    useLocal = false;
  } catch (error) {
    console.warn('MongoDB connection failed. Falling back to local JSON database (db.json).');
    console.warn(`Error details: ${error.message}`);
    useLocal = true;
    // Ensure local DB exists
    await readLocalDB();
  }
};

export const hashPassword = (password) => {
  if (!password) return '';
  const salt = 'canvas-board-salt-1289';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

export const verifyPassword = (password, hashedPassword) => {
  if (!password || !hashedPassword) return false;
  return hashPassword(password) === hashedPassword || password === hashedPassword;
};

export const getBoards = async () => {
  if (!useLocal) {
    // Project only basic fields and the ID/types of arrays to count details without loading large base64 content
    return await BoardModel.find({}, 'name updatedAt zoom pan protectionMode preset cards.id cards.type connections.id drawings.tool').sort({ updatedAt: -1 });
  } else {
    const db = await readLocalDB();
    return db.boards.map(b => ({
      _id: b._id,
      name: b.name,
      updatedAt: b.updatedAt,
      zoom: b.zoom,
      pan: b.pan,
      protectionMode: b.protectionMode || 'none',
      preset: b.preset || 'freestyle',
      cards: (b.cards || []).map(c => ({ id: c.id, type: c.type })),
      connections: (b.connections || []).map(c => ({ id: c.id })),
      drawings: (b.drawings || []).map(d => ({ tool: d.tool }))
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
};

export const getBoardById = async (id) => {
  if (!useLocal) {
    return await BoardModel.findById(id);
  } else {
    const db = await readLocalDB();
    return db.boards.find(b => b._id === id) || null;
  }
};

export const createBoard = async (name, password = '', protectionMode = 'none', preset = 'freestyle') => {
  const hashedPassword = password ? hashPassword(password) : '';
  if (!useLocal) {
    const board = new BoardModel({ name, password: hashedPassword, protectionMode, preset });
    return await board.save();
  } else {
    const db = await readLocalDB();
    const newBoard = {
      _id: Math.random().toString(36).substring(2, 11),
      name,
      password: hashedPassword,
      protectionMode,
      preset,
      cards: [],
      connections: [],
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
  if (!useLocal) {
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

    return await BoardModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );
  } else {
    const db = await readLocalDB();
    const index = db.boards.findIndex(b => b._id === id);
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
  if (!useLocal) {
    const existingBoard = await BoardModel.findById(id);
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

    const updateFields = {};
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

    return await BoardModel.findByIdAndUpdate(
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
  if (!useLocal) {
    return await BoardModel.findByIdAndDelete(id);
  } else {
    const db = await readLocalDB();
    const index = db.boards.findIndex(b => b._id === id);
    if (index === -1) return null;
    const deleted = db.boards.splice(index, 1)[0];
    await writeLocalDB(db);
    return deleted;
  }
};
