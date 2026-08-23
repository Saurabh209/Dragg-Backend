import mongoose from 'mongoose';

export const AttachmentSchema = new mongoose.Schema({
  name: String,
  mimeType: String,
  size: Number,
  dataUrl: String
});

export const CardFeaturesSchema = new mongoose.Schema({
  notes: { type: Boolean, default: true },
  sketch: { type: Boolean, default: true },
  attachments: { type: Boolean, default: true },
  tags: { type: Boolean, default: true },
  colorPalette: { type: Boolean, default: true },
  completedStatus: { type: Boolean, default: true },
  connectPorts: { type: Boolean, default: true }
}, { _id: false });

export const CardSchema = new mongoose.Schema({
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

export const ConnectionSchema = new mongoose.Schema({
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
  toOffsetY: Number,
  waypoints: [{ x: Number, y: Number }]
});

export const StrokePointSchema = new mongoose.Schema({
  x: Number,
  y: Number
}, { _id: false });

export const StrokeSchema = new mongoose.Schema({
  tool: String,
  color: String,
  thickness: Number,
  points: [StrokePointSchema]
}, { _id: false });

export const BoardSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'b_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5) },
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

export const BoardModel = mongoose.models.Board || mongoose.model('Board', BoardSchema);
