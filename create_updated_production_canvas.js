import dotenv from 'dotenv';
import { connectDB, createBoard, updateBoard, getBoards, getBoardById, hashPassword } from './db.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/canvas-board';

const newSeedData = {
  name: '📘 Dragg — Ultimate Complete Feature System',
  password: 'way2hell',
  protectionMode: 'full',
  pan: { x: 600, y: 150 },
  zoom: 0.2,
  drawings: [],
  cards: [

    // =========================================================================
    // SECTION 1: ARCHITECTURE & CORE SYSTEM (y: 0)
    // =========================================================================
    {
      id: 'hdr-arch',
      x: -400,
      y: -140,
      width: 1950,
      height: 90,
      title: '🚀 SECTION 1: ARCHITECTURE & CORE SYSTEM DESIGN',
      content: '',
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      features: { notes: false, sketch: false, attachments: false, tags: false, colorPalette: false, completedStatus: false, connectPorts: false }
    },
    {
      id: 'arch-overview',
      x: -400,
      y: 0,
      width: 450,
      height: 520,
      title: '🏗️ System Architecture & Modular Layout',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #06b6d4; margin-top: 0; font-size: 17px;">System Design Overview</h3>
<p>Dragg is a high-performance visual workspace engine built on a <b>decoupled MERN / Vite architecture</b> for real-time visual collaboration, node routing, and code execution.</p>

<div class="notes-callout-box" style="margin: 12px 0;">
  ⚡ <b>Core Architecture Stack:</b><br/>
  • <b>Frontend:</b> React 18, Vite, Lucide Icons, HTML Canvas API<br/>
  • <b>Backend:</b> Node.js, Express REST API, Mongoose ODM<br/>
  • <b>Database:</b> MongoDB Atlas / Local Dual Storage Fallback
</div>

<h4 style="color: #10b981; margin-bottom: 4px;">Key Architectural Highlights:</h4>
<ul>
  <li><b>State Synchronization:</b> Bi-directional state management between React hooks and local/remote DB.</li>
  <li><b>Hardware Acceleration:</b> Vector canvas rendering using CSS matrix transforms & 2D Context.</li>
  <li><b>Dual DB Fallback:</b> Automatic offline JSON storage mode if MongoDB cluster connection fails.</li>
</ul>
</div>`,
      code: `// System Architecture Core Entry Point
import express from 'express';
import { connectDB } from './db.js';

const app = express();
connectDB(process.env.MONGO_URI);
app.listen(5000, () => console.log("Dragg Server Active"));`,
      language: 'javascript',
      tags: ['architecture', 'mern', 'express', 'react'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      isStartNode: true,
      badge: { text: 'Entry Point', color: '#881337' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'tech-stack',
      x: 100,
      y: 0,
      width: 450,
      height: 520,
      title: '⚡ Technology Stack & Dependencies',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #10b981; margin-top: 0; font-size: 17px;">Tech Stack Breakdown</h3>
<p>Curated modern web technologies ensuring zero-lag manipulation of thousands of canvas nodes.</p>

<div class="notes-callout-box" style="border-left-color: #10b981;">
  🛠️ <b>Technology Tooling:</b><br/>
  • <span style="color: #06b6d4;">Vite 5.0:</span> Blazing fast HMR dev server & bundling.<br/>
  • <span style="color: #f59e0b;">Lucide React:</span> Pixel-perfect UI micro-icons.<br/>
  • <span style="color: #f43f5e;">Piston API:</span> Isolated multi-language code execution engine.<br/>
  • <span style="color: #10b981;">PBKDF2:</span> Salted crypto hashing for board authentication.
</div>

<h4 style="color: #06b6d4;">Backend Packages:</h4>
<code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; display: block; margin-top: 6px;">
express | mongoose | cors | dotenv | crypto | multer
</code>
</div>`,
      tags: ['vite', 'react', 'piston', 'dependencies'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      badge: { text: 'Feature', color: '#065f46' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'app-routing',
      x: 600,
      y: 0,
      width: 450,
      height: 520,
      title: '🔀 App.jsx — State-Driven Navigation',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f59e0b; margin-top: 0; font-size: 17px;">State-Based View Switcher</h3>
<p>Seamlessly transitions between Dashboard management and active Infinite Whiteboard view without full page reloads.</p>

<div class="notes-callout-box" style="border-left-color: #f59e0b;">
  🧭 <b>View Modes:</b><br/>
  1. <b>Dashboard View:</b> List all boards, filter, search, create & password prompt.<br/>
  2. <b>Canvas View:</b> Interactive whiteboard editor with active board session.<br/>
  3. <b>View-Only Mode:</b> Read-only mode for protected or locked whiteboards.
</div>
</div>`,
      tags: ['routing', 'view-state', 'react-hooks'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'backend-api',
      x: 1100,
      y: 0,
      width: 450,
      height: 520,
      title: '🌐 Backend REST API & Server Endpoints',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f43f5e; margin-top: 0; font-size: 17px;">REST API Specification</h3>
<p>Complete set of CRUD endpoints for board state, card updates, password validation, and delta patching.</p>

<div class="notes-callout-box" style="border-left-color: #f43f5e;">
  📡 <b>API Routes:</b><br/>
  • <span style="color: #10b981;">GET</span> <code>/api/boards</code> — Fetch all board metadata<br/>
  • <span style="color: #06b6d4;">POST</span> <code>/api/boards</code> — Create new canvas<br/>
  • <span style="color: #f59e0b;">POST</span> <code>/api/boards/:id/verify</code> — Password authentication<br/>
  • <span style="color: #06b6d4;">PUT/PATCH</span> <code>/api/boards/:id</code> — Update canvas state<br/>
  • <span style="color: #f43f5e;">DELETE</span> <code>/api/boards/:id</code> — Delete canvas
</div>
</div>`,
      tags: ['express', 'rest-api', 'endpoints'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'db-layer',
      x: 1600,
      y: 0,
      width: 450,
      height: 520,
      title: '🗄️ Database Layer & Dual-Storage Strategy',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #06b6d4; margin-top: 0; font-size: 17px;">MongoDB & Local JSON Fallback</h3>
<p>Automatic failover architecture ensuring 100% data preservation even during database maintenance or network drops.</p>

<div class="notes-callout-box" style="border-left-color: #06b6d4;">
  🛡️ <b>Dual Storage Mechanism:</b><br/>
  • <b>Primary:</b> MongoDB Atlas / Local MongoDB instance via Mongoose.<br/>
  • <b>Secondary Fallback:</b> Atomic disk file writer (<code>db.json</code>) if MongoDB times out after 3 seconds.
</div>
</div>`,
      tags: ['mongodb', 'mongoose', 'fallback', 'db-json'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },

    // =========================================================================
    // SECTION 2: DASHBOARD, IMPORT & SECURITY (y: 650)
    // =========================================================================
    {
      id: 'hdr-dashboard',
      x: -400,
      y: 540,
      width: 1950,
      height: 90,
      title: '📋 SECTION 2: DASHBOARD, IMPORT SYSTEM & SECURITY',
      content: '',
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      features: { notes: false, sketch: false, attachments: false, tags: false, colorPalette: false, completedStatus: false, connectPorts: false }
    },
    {
      id: 'dashboard-main',
      x: -400,
      y: 680,
      width: 450,
      height: 520,
      title: '📋 Dashboard & Board Manager Grid',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #06b6d4; margin-top: 0; font-size: 17px;">Board Management Interface</h3>
<p>Central hub for creating, searching, filtering, and organizing whiteboards with real-time statistics and preview metadata.</p>

<div class="notes-callout-box">
  📊 <b>Dashboard Capabilities:</b><br/>
  • Live search filter by board title & protection status.<br/>
  • Node count badge (cards, connection links, drawings).<br/>
  • Instant modal creation with password assignment.<br/>
  • Security badge indicators (Full / Partial / Unprotected).
</div>
</div>`,
      tags: ['dashboard', 'board-manager', 'ui'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      badge: { text: 'Feature', color: '#065f46' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'dashboard-import',
      x: 100,
      y: 680,
      width: 450,
      height: 520,
      title: '📥 JSON & Standalone .notes File Importer',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #10b981; margin-top: 0; font-size: 17px;">Smart Notes File Importer</h3>
<p>Allows instant drag-and-drop or file upload of <code>.json</code> and standalone <code>.notes</code> documents into full-fledged canvas cards.</p>

<div class="notes-callout-box" style="border-left-color: #10b981;">
  📄 <b>Supported Import Formats:</b><br/>
  • <b>Full Board JSON:</b> Restores entire whiteboards with cards & links.<br/>
  • <b>Standalone .notes:</b> Auto-converts formatted text files into rich-text cards.
</div>
</div>`,
      tags: ['import', 'notes-file', 'json'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'dashboard-keybindings',
      x: 600,
      y: 680,
      width: 450,
      height: 520,
      title: '⌨️ Customizable Keyboard Shortcuts System',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f59e0b; margin-top: 0; font-size: 17px;">Canvas Keybindings Engine</h3>
<p>Accelerate your workflow with intuitive single-key hotkeys for seamless tool switching and canvas navigation.</p>

<div class="notes-callout-box" style="border-left-color: #f59e0b;">
  ⌨️ <b>Default Keyboard Shortcuts:</b><br/>
  • <span style="color: #06b6d4;">V</span> — Select / Move tool<br/>
  • <span style="color: #10b981;">C</span> — Connector wire tool<br/>
  • <span style="color: #f59e0b;">E</span> — Stroke Eraser tool<br/>
  • <span style="color: #f43f5e;">Delete / Backspace</span> — Remove selected node
</div>
</div>`,
      tags: ['keybindings', 'shortcuts', 'ux'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'security-system',
      x: 1100,
      y: 680,
      width: 450,
      height: 520,
      title: '🔒 Password Protection & Authentication Engine',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f43f5e; margin-top: 0; font-size: 17px;">Cryptographic Security System</h3>
<p>Enterprise-grade security preventing unauthorized viewing or modification of whiteboards.</p>

<div class="notes-callout-box" style="border-left-color: #f43f5e;">
  🔐 <b>Protection Modes:</b><br/>
  • <b>Full Protection (<code>full</code>):</b> Password required even to view whiteboard.<br/>
  • <b>Partial Protection (<code>partial</code>):</b> Anyone can view, password needed to edit.<br/>
  • <b>Unprotected (<code>none</code>):</b> Public collaborative board.<br/><br/>
  🔑 <i>Passwords hashed using PBKDF2 with 64-byte SHA512 key derivation.</i>
</div>
</div>`,
      tags: ['security', 'pbkdf2', 'password-protection'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      badge: { text: 'Security', color: '#9f1239' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },

    // =========================================================================
    // SECTION 3: CANVAS VIEWPORT & INTERACTION TOOLS (y: 1350)
    // =========================================================================
    {
      id: 'hdr-canvas',
      x: -400,
      y: 1220,
      width: 1950,
      height: 90,
      title: '🔭 SECTION 3: INFINITE CANVAS VIEWPORT & INTERACTION TOOLS',
      content: '',
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      features: { notes: false, sketch: false, attachments: false, tags: false, colorPalette: false, completedStatus: false, connectPorts: false }
    },
    {
      id: 'canvas-viewport',
      x: -400,
      y: 1360,
      width: 450,
      height: 520,
      title: '🔭 Infinite Canvas Viewport Engine',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f43f5e; margin-top: 0; font-size: 17px;">2D Matrix Transform Engine</h3>
<p>GPU-accelerated panning and zooming supporting infinite spatial expansion across 2D coordinates.</p>

<div class="notes-callout-box" style="border-left-color: #f43f5e;">
  🔍 <b>Viewport Parameters:</b><br/>
  • <b>Zoom Range:</b> 10% (0.1x overview) to 200% (2.0x deep zoom).<br/>
  • <b>Pan State:</b> Real-time 2D offset vector <code>{ x, y }</code>.<br/>
  • <b>Recenter Shortcut:</b> Instant double-click reset or toolbar recapping.
</div>
</div>`,
      tags: ['viewport', 'infinite-canvas', 'panning'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'canvas-touch',
      x: 100,
      y: 1360,
      width: 450,
      height: 520,
      title: '📱 Multi-Touch Gesture Navigation',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #06b6d4; margin-top: 0; font-size: 17px;">Mobile & Tablet Touch Engine</h3>
<p>Full touch-event listeners for pinch-to-zoom, two-finger panning, and double-tap node focusing on mobile devices.</p>

<div class="notes-callout-box">
  📱 <b>Gestures Supported:</b><br/>
  • <b>Pinch Zoom:</b> Natural two-finger distance calculation.<br/>
  • <b>Two-Finger Pan:</b> Drag canvas without triggering node selection.<br/>
  • <b>Double Tap:</b> Instant zoom focus on any card element.
</div>
</div>`,
      tags: ['touch-gestures', 'mobile', 'pinch-zoom'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'ruler-tool',
      x: 600,
      y: 1360,
      width: 450,
      height: 520,
      title: '📐 Ruler Tool & Pixel Measurement',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #10b981; margin-top: 0; font-size: 17px;">Visual Measurement Overlay</h3>
<p>Interactive ruler tool allowing precise pixel distance measurement and alignment guides across canvas nodes.</p>

<div class="notes-callout-box" style="border-left-color: #10b981;">
  📐 <b>Ruler Functionality:</b><br/>
  • Click-and-drag line measurement across any two points.<br/>
  • Displays real-time pixel length <code>ΔX, ΔY</code> and Euclidean distance.<br/>
  • Visual alignment guidelines for diagram layout precision.
</div>
</div>`,
      tags: ['ruler', 'measurement', 'tools'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      badge: { text: 'New Tool', color: '#0e7490' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'grid-bg-system',
      x: 1100,
      y: 1360,
      width: 450,
      height: 520,
      title: '🌐 10 Canvas Grid Patterns & Color Picker',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f59e0b; margin-top: 0; font-size: 17px;">Customizable Backgrounds</h3>
<p>Switch between 10 high-tech SVG background grid patterns and custom canvas background color palettes.</p>

<div class="notes-callout-box" style="border-left-color: #f59e0b;">
  🎨 <b>Grid Patterns:</b><br/>
  Dotted, Micro Dots, Graph Lines, Major/Minor, Crosshairs, Isometric, Honeycomb Hex, Blueprint Blue, Ruled Lines, Blank.<br/><br/>
  🎨 <b>Canvas Background Colors:</b><br/>
  Dark Pitch, Deep Slate, Midnight Navy, Deep Emerald, Deep Purple, Blueprint.
</div>
</div>`,
      tags: ['grid-patterns', 'background', 'themes'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      badge: { text: 'New Feature', color: '#065f46' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },

    // =========================================================================
    // SECTION 4: SMART CARDS, TYPOGRAPHY & COMPILER (y: 2050)
    // =========================================================================
    {
      id: 'hdr-cards',
      x: -400,
      y: 1910,
      width: 1950,
      height: 90,
      title: '🃏 SECTION 4: SMART CARDS, RICH TYPOGRAPHY & COMPILER',
      content: '',
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      features: { notes: false, sketch: false, attachments: false, tags: false, colorPalette: false, completedStatus: false, connectPorts: false }
    },
    {
      id: 'card-system',
      x: -400,
      y: 2050,
      width: 450,
      height: 520,
      title: '🃏 Smart Card Anatomy & Tab System',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #10b981; margin-top: 0; font-size: 17px;">Multi-Tab Card Container</h3>
<p>Each card is an extensible workspace module supporting notes, code execution, freehand sketching, and file attachments.</p>

<div class="notes-callout-box" style="border-left-color: #10b981;">
  📑 <b>Card Modes:</b><br/>
  • <b>Notes Tab:</b> WYSIWYG HTML rich text editor.<br/>
  • <b>Code Tab:</b> Full Monaco-style code sandbox with Piston compiler.<br/>
  • <b>Sketch Tab:</b> Embedded mini HTML canvas drawing pad.<br/>
  • <b>Attachments Tab:</b> File uploader & download manager.
</div>
</div>`,
      tags: ['card-system', 'tabs', 'anatomy'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'typography-engine',
      x: 100,
      y: 2050,
      width: 450,
      height: 520,
      title: '✒️ Advanced Typography & Callout Boxes',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #581c87; margin-top: 0; font-size: 17px;">Rich Text Formatting Controls</h3>
<p>Granular text formatting including font sizes, text color palettes, font families, and container callout boxes.</p>

<div class="notes-callout-box" style="border-left-color: #581c87;">
  ✒️ <b>Formatting Options:</b><br/>
  • <span style="font-size: 12px;">Small</span> | <span style="font-size: 14px;">Medium</span> | <span style="font-size: 18px;">Large</span> | <span style="font-size: 22px; font-weight: bold;">Title / XL</span><br/>
  • <span style="color: #06b6d4;">Cyan</span> | <span style="color: #10b981;">Emerald</span> | <span style="color: #f59e0b;">Amber</span> | <span style="color: #f43f5e;">Rose</span> | <span style="color: #ffffff;">Default</span><br/>
  • <b>Fonts:</b> Sans-Serif, Serif, Monospace<br/>
  • <b>Callout Container Boxes:</b> Highlight critical notes with removable styled callout blocks.
</div>
</div>`,
      tags: ['typography', 'formatting', 'callout-boxes'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      badge: { text: 'New Feature', color: '#581c87' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'card-code-tab',
      x: 600,
      y: 2050,
      width: 450,
      height: 520,
      title: '💻 Multi-Language Piston Sandbox Compiler',
      content: '',
      code: `// Multi-Language Code Compiler Engine
// Supports 11 languages with stdout/stderr capture

async function runCode(lang, code) {
  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: lang, version: "*", files: [{ content: code }] })
  });
  const data = await res.json();
  console.log("Output:", data.run.output);
}

runCode("javascript", "console.log('Dragg Compiler Ready!');");`,
      language: 'javascript',
      tags: ['piston', 'compiler', 'code-execution'],
      color: 'rose',
      type: 'note',
      cardMode: 'code',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'card-sketch-tab',
      x: 1100,
      y: 2050,
      width: 450,
      height: 520,
      title: '🖌️ Mini Drawing Canvas (Sketch Tab)',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #06b6d4; margin-top: 0; font-size: 17px;">Per-Card HTML Canvas Sketching</h3>
<p>Each card hosts an independent mini canvas for quick diagrams, handwritten annotations, and sketches.</p>

<div class="notes-callout-box">
  🖌️ <b>Sketch Pad Features:</b><br/>
  • Freehand pen drawing with color picker.<br/>
  • Stroke eraser tool.<br/>
  • Auto-serialization to base64 data URLs in DB.<br/>
  • Clear & reset canvas controls.
</div>
</div>`,
      tags: ['sketch', 'mini-canvas', 'drawing'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },

    // =========================================================================
    // SECTION 5: CONNECTIONS, BADGES & VECTOR DRAWINGS (y: 2740)
    // =========================================================================
    {
      id: 'hdr-connections',
      x: -400,
      y: 2600,
      width: 1950,
      height: 90,
      title: '🔗 SECTION 5: CONNECTIONS, BADGES & VECTOR DRAWINGS',
      content: '',
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      features: { notes: false, sketch: false, attachments: false, tags: false, colorPalette: false, completedStatus: false, connectPorts: false }
    },
    {
      id: 'connections-system',
      x: -400,
      y: 2740,
      width: 450,
      height: 520,
      title: '🔗 Dynamic Bezier Curve Connections',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f59e0b; margin-top: 0; font-size: 17px;">Vector Wire Routing Engine</h3>
<p>Renders smooth cubic Bezier curve links between side snap ports with customizable directional arrows and labels.</p>

<div class="notes-callout-box" style="border-left-color: #f59e0b;">
  🔗 <b>Connection Wire Features:</b><br/>
  • 4-Side Snap Ports (Top, Right, Bottom, Left).<br/>
  • Interactive label editing on wire midpoint.<br/>
  • Real-time curve re-computation on node drag.<br/>
  • Wire delete handles & selection highlighting.
</div>
</div>`,
      tags: ['connections', 'bezier-curves', 'wire-routing'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'badge-startnode-system',
      x: 100,
      y: 2740,
      width: 450,
      height: 520,
      title: '🏷️ High-Tone Badges & Start Node Indicators',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #92400e; margin-top: 0; font-size: 17px;">Node Badges & Flowchart Entry</h3>
<p>Classify cards with vibrant high-tone status badges and mark initial execution nodes with pulsing start indicators.</p>

<div class="notes-callout-box" style="border-left-color: #92400e;">
  🏷️ <b>Badge Presets & Tones:</b><br/>
  • <b>Presets:</b> Entry Point, Bug, Deadend, Feature, Flow Node.<br/>
  • <b>High-Tone Palettes:</b> Dark Crimson (#881337), Dark Ruby (#9f1239), Dark Purple (#581c87), Dark Amber (#92400e), Dark Emerald (#065f46), Dark Cyan (#0e7490).<br/>
  • <b>Start Node Flag:</b> Pulsing glow ring denoting diagram entry points.
</div>
</div>`,
      tags: ['badges', 'start-node', 'classification'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      badge: { text: 'Flow Node', color: '#92400e' },
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'drawing-system',
      x: 600,
      y: 2740,
      width: 450,
      height: 520,
      title: '✏️ Freehand Pen & Stroke Eraser System',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f43f5e; margin-top: 0; font-size: 17px;">Global Canvas Annotation Layer</h3>
<p>Draw vector strokes anywhere across the infinite canvas, overlaying cards and wire connections.</p>

<div class="notes-callout-box" style="border-left-color: #f43f5e;">
  ✏️ <b>Pen Layer Features:</b><br/>
  • Smooth quadratic curve stroke interpolation.<br/>
  • Customizable stroke width & color palette.<br/>
  • Precision Stroke Eraser tool for removing drawn lines.
</div>
</div>`,
      tags: ['pen-tool', 'freehand-drawing', 'annotations'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'card-features-toggle',
      x: 1100,
      y: 2740,
      width: 450,
      height: 520,
      title: '⚙️ Granular Card Feature Toggle Flags',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #10b981; margin-top: 0; font-size: 17px;">Selective Component Visibility</h3>
<p>Customize each card's feature set individually by toggling specific modules on or off.</p>

<div class="notes-callout-box" style="border-left-color: #10b981;">
  ⚙️ <b>Configurable Feature Flags:</b><br/>
  • <code>notes</code> (Rich Editor) | <code>sketch</code> (Drawing Pad)<br/>
  • <code>attachments</code> (File List) | <code>tags</code> (Tag Pills)<br/>
  • <code>colorPalette</code> (Card Color) | <code>completedStatus</code> (Checkbox)<br/>
  • <code>connectPorts</code> (Side Connection Ports)
</div>
</div>`,
      tags: ['feature-flags', 'customization', 'card-config'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },

    // =========================================================================
    // SECTION 6: OUTLINE, BIRD'S EYE & HIGH-RES EXPORT (y: 3430)
    // =========================================================================
    {
      id: 'hdr-export',
      x: -400,
      y: 3290,
      width: 1950,
      height: 90,
      title: '📸 SECTION 6: OUTLINE, BIRD\'S EYE MAP & HIGH-RES EXPORT',
      content: '',
      color: 'purple',
      type: 'note',
      cardMode: 'notes',
      features: { notes: false, sketch: false, attachments: false, tags: false, colorPalette: false, completedStatus: false, connectPorts: false }
    },
    {
      id: 'save-system',
      x: -400,
      y: 3430,
      width: 450,
      height: 520,
      title: '💾 Real-Time Auto-Save & Delta Persistence Engine',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #581c87; margin-top: 0; font-size: 17px;">Debounced Real-Time Synchronization</h3>
<p>Zero-latency local edits with background debounced HTTP PATCH sync to MongoDB production database.</p>

<div class="notes-callout-box" style="border-left-color: #581c87;">
  💾 <b>Save System Pipeline:</b><br/>
  • <b>Instant Local Update:</b> Immediate UI re-render on keypress.<br/>
  • <b>Debounced HTTP PATCH:</b> 500ms debounce buffer before database commit.<br/>
  • <b>Save Status Indicator:</b> Top status bar displaying <i>Saved</i> vs <i>Saving...</i>
</div>
</div>`,
      tags: ['auto-save', 'delta-patch', 'persistence'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'outline-birds-eye',
      x: 100,
      y: 3430,
      width: 450,
      height: 520,
      title: 'MAP Outline & Bird\'s Eye Navigation Panel',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #06b6d4; margin-top: 0; font-size: 17px;">Macro Canvas Navigation</h3>
<p>Collapsible sidebar providing a tree view of all cards and a minimap viewport indicator for instant canvas jumps.</p>

<div class="notes-callout-box">
  🗺️ <b>Navigation Features:</b><br/>
  • <b>Outline Tree:</b> List cards by section & title with click-to-jump.<br/>
  • <b>Bird's Eye Minimap:</b> Miniature spatial preview showing canvas viewport rectangle.
</div>
</div>`,
      tags: ['outline', 'minimap', 'navigation'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    },
    {
      id: 'export-system',
      x: 600,
      y: 3430,
      width: 450,
      height: 520,
      title: '📸 High-Resolution PNG Export & DB Seeder Engine',
      content: `<div style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">
<h3 style="color: #f59e0b; margin-top: 0; font-size: 17px;">Export & Seeding Tooling</h3>
<p>Export whole whiteboards as high-resolution PNG image snapshots or full JSON backup datasets.</p>

<div class="notes-callout-box" style="border-left-color: #f59e0b;">
  📸 <b>Export Utilities:</b><br/>
  • <b>PNG Canvas Snapshot:</b> Render canvas elements directly to downloadable image.<br/>
  • <b>JSON Whiteboard Backup:</b> Full data backup export.<br/>
  • <b>DB Seeder Scripts:</b> Automated node & link population scripts.
</div>
</div>`,
      tags: ['png-export', 'json-backup', 'seeding'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      features: { notes: true, sketch: true, attachments: true, tags: true, colorPalette: true, completedStatus: true, connectPorts: true }
    }
  ],
  connections: [
    // Section 1 flow
    { id: 'c-1-1', fromCardId: 'arch-overview', fromSide: 'right', toCardId: 'tech-stack', toSide: 'left', label: 'Uses Tech Stack' },
    { id: 'c-1-2', fromCardId: 'tech-stack', fromSide: 'right', toCardId: 'app-routing', toSide: 'left', label: 'Drives Navigation' },
    { id: 'c-1-3', fromCardId: 'app-routing', fromSide: 'right', toCardId: 'backend-api', toSide: 'left', label: 'Calls Endpoints' },
    { id: 'c-1-4', fromCardId: 'backend-api', fromSide: 'right', toCardId: 'db-layer', toSide: 'left', label: 'Queries DB' },

    // Section 2 flow
    { id: 'c-2-1', fromCardId: 'dashboard-main', fromSide: 'right', toCardId: 'dashboard-import', toSide: 'left', label: 'Imports Data' },
    { id: 'c-2-2', fromCardId: 'dashboard-import', fromSide: 'right', toCardId: 'dashboard-keybindings', toSide: 'left', label: 'Shortcuts' },
    { id: 'c-2-3', fromCardId: 'dashboard-keybindings', fromSide: 'right', toCardId: 'security-system', toSide: 'left', label: 'Authenticates' },

    // Section 3 flow
    { id: 'c-3-1', fromCardId: 'canvas-viewport', fromSide: 'right', toCardId: 'canvas-touch', toSide: 'left', label: 'Handles Touch' },
    { id: 'c-3-2', fromCardId: 'canvas-touch', fromSide: 'right', toCardId: 'ruler-tool', toSide: 'left', label: 'Measures Pixels' },
    { id: 'c-3-3', fromCardId: 'ruler-tool', fromSide: 'right', toCardId: 'grid-bg-system', toSide: 'left', label: 'Renders Grid' },

    // Section 4 flow
    { id: 'c-4-1', fromCardId: 'card-system', fromSide: 'right', toCardId: 'typography-engine', toSide: 'left', label: 'Formats Text' },
    { id: 'c-4-2', fromCardId: 'typography-engine', fromSide: 'right', toCardId: 'card-code-tab', toSide: 'left', label: 'Compiles Code' },
    { id: 'c-4-3', fromCardId: 'card-code-tab', fromSide: 'right', toCardId: 'card-sketch-tab', toSide: 'left', label: 'Sketches' },

    // Section 5 flow
    { id: 'c-5-1', fromCardId: 'connections-system', fromSide: 'right', toCardId: 'badge-startnode-system', toSide: 'left', label: 'Marks Start' },
    { id: 'c-5-2', fromCardId: 'badge-startnode-system', fromSide: 'right', toCardId: 'drawing-system', toSide: 'left', label: 'Draws Lines' },
    { id: 'c-5-3', fromCardId: 'drawing-system', fromSide: 'right', toCardId: 'card-features-toggle', toSide: 'left', label: 'Configures Flags' },

    // Section 6 flow
    { id: 'c-6-1', fromCardId: 'save-system', fromSide: 'right', toCardId: 'outline-birds-eye', toSide: 'left', label: 'Navigates' },
    { id: 'c-6-2', fromCardId: 'outline-birds-eye', fromSide: 'right', toCardId: 'export-system', toSide: 'left', label: 'Exports Canvas' },

    // Vertical Section Linkers
    { id: 'v-1-2', fromCardId: 'arch-overview', fromSide: 'bottom', toCardId: 'dashboard-main', toSide: 'top', label: 'Launches' },
    { id: 'v-2-3', fromCardId: 'dashboard-main', fromSide: 'bottom', toCardId: 'canvas-viewport', toSide: 'top', label: 'Loads Canvas' },
    { id: 'v-3-4', fromCardId: 'canvas-viewport', fromSide: 'bottom', toCardId: 'card-system', toSide: 'top', label: 'Renders Cards' },
    { id: 'v-4-5', fromCardId: 'card-system', fromSide: 'bottom', toCardId: 'connections-system', toSide: 'top', label: 'Links Nodes' },
    { id: 'v-5-6', fromCardId: 'connections-system', fromSide: 'bottom', toCardId: 'save-system', toSide: 'top', label: 'Saves State' }
  ]
};

const executeProductionCanvasSeeding = async () => {
  console.log('🚀 Connecting to Production Database (MongoDB)...');
  await connectDB(MONGO_URI);

  try {
    console.log('🔍 Checking existing production boards...');
    const existingBoards = await getBoards();
    console.log(`Found ${existingBoards.length} total boards in production DB.`);

    const matchingBoard = existingBoards.find(b => 
      b.name && b.name.toLowerCase().includes('dragg') && b.name.toLowerCase().includes('complete feature')
    );

    if (matchingBoard) {
      console.log(`📌 Found original target board: "${matchingBoard.name}" [ID: ${matchingBoard._id}]`);
      const fullBoard = await getBoardById(matchingBoard._id);
      console.log(`   Read existing data: ${fullBoard.cards?.length || 0} cards, ${fullBoard.connections?.length || 0} connections.`);
    } else {
      console.log('ℹ️ Note: No board matching "dragg complete feature" explicitly found. Proceeding to create new canvas with password.');
    }

    console.log('\n✨ Creating new production canvas...');
    console.log(`   Title: "${newSeedData.name}"`);
    console.log(`   Password: "${newSeedData.password}" (hashed with PBKDF2)`);
    console.log(`   Protection Mode: "${newSeedData.protectionMode}"`);

    // Create the board with password 'way2hell' and full protection
    const createdBoard = await createBoard(newSeedData.name, newSeedData.password, newSeedData.protectionMode);
    
    console.log(`✅ Canvas initialized in DB with ID: ${createdBoard._id}`);
    console.log('Updating cards, connections, section headers, badges & rich typography...');

    const updatedBoard = await updateBoard(createdBoard._id, {
      pan: newSeedData.pan,
      zoom: newSeedData.zoom,
      cards: newSeedData.cards,
      connections: newSeedData.connections,
      drawings: newSeedData.drawings
    });

    console.log('\n🎉 SUCCESS! New canvas created in production DB:');
    console.log(`   • Canvas ID: ${updatedBoard._id}`);
    console.log(`   • Canvas Name: ${updatedBoard.name}`);
    console.log(`   • Password: way2hell`);
    console.log(`   • Protection Mode: ${updatedBoard.protectionMode}`);
    console.log(`   • Total Cards (Nodes + Banners): ${updatedBoard.cards?.length}`);
    console.log(`   • Total Connections: ${updatedBoard.connections?.length}`);

  } catch (error) {
    console.error('❌ Error creating production canvas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔒 Database connection closed cleanly.');
    process.exit(0);
  }
};

executeProductionCanvasSeeding();
