import mongoose from 'mongoose';

export const SystemNodePortSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['input', 'output', 'bidirectional'], default: 'bidirectional' },
  label: String
}, { _id: false });

export const SystemNodeSchema = new mongoose.Schema({
  id: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  title: String,
  nodeCategory: { type: String, default: 'microservice' }, // 'frontend' | 'gateway' | 'microservice' | 'database' | 'cache' | 'queue'
  specs: {
    cpu: String,
    memory: String,
    replicas: Number,
    techStack: String
  },
  ports: [SystemNodePortSchema],
  color: String,
  nodeLayout: { type: String, default: 'four-node' },
  isStartNode: { type: Boolean, default: false },
  badge: {
    text: { type: String, default: '' },
    color: { type: String, default: '' }
  },
  highlightId: { type: String, default: '' }
});

export const OrthogonalConnectionSchema = new mongoose.Schema({
  id: String,
  fromCardId: String,
  toCardId: String,
  fromSide: String,
  toSide: String,
  label: String,
  style: String,
  color: String,
  animation: String,
  thickness: Number,
  fromOffsetX: Number,
  fromOffsetY: Number,
  toOffsetX: Number,
  toOffsetY: Number,
  customId: { type: String, default: '' },
  waypoints: [{ x: Number, y: Number }],
  protocol: { type: String, default: 'gRPC' }, // 'HTTP' | 'gRPC' | 'Kafka' | 'TCP'
  latencyMs: { type: Number, default: 5 },
  routingMode: { type: String, default: 'orthogonal' } // 'orthogonal' | 'bezier'
});

export const SystemDesignCanvasSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'sd_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5) },
  name: { type: String, required: true },
  password: { type: String, default: '' },
  protectionMode: { type: String, enum: ['none', 'full', 'partial'], default: 'none' },
  preset: { type: String, default: 'system_design' },
  cards: { type: [SystemNodeSchema], default: [] },
  connections: { type: [OrthogonalConnectionSchema], default: [] },
  drawings: { type: Array, default: [] },
  pan: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  zoom: { type: Number, default: 1 },
  boardBgColor: { type: String, default: '#0d1117' },
  liveBgStyle: { type: String, default: 'grid' }
}, { timestamps: true, strict: false });

export const SystemDesignCanvasModel = mongoose.models.SystemDesignCanvas || mongoose.model('SystemDesignCanvas', SystemDesignCanvasSchema, 'systemDesignBoard');
export const SystemDesignBoardModel = SystemDesignCanvasModel;

