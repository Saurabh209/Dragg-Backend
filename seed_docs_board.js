import dotenv from 'dotenv';
import { connectDB, createBoard, updateBoard } from './db.js';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/canvas-board';

// =====================================================
//  DRAGG — Complete Feature Documentation Board
//  Every card documents a feature in depth
// =====================================================

const seedData = {
  name: '📘 Dragg — Complete Feature Documentation',
  pan: { x: 600, y: 200 },
  zoom: 0.22,
  drawings: [],
  cards: [

    // ─────────────────────────────────────────────────────
    //  ROW 0 — ARCHITECTURE OVERVIEW (y: 0)
    // ─────────────────────────────────────────────────────

    {
      id: 'arch-overview',
      x: 0,
      y: 0,
      width: 520,
      height: 520,
      title: '🏗️ Architecture Overview',
      content: '<b>Dragg</b> is a full-stack infinite whiteboard application built with a <b>React + Vite</b> frontend and an <b>Express + MongoDB</b> backend.\n\n<b>Project Root Structure:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>dragg/\n├── frontend/          (React + Vite SPA)\n│   ├── src/\n│   │   ├── App.jsx          (Root component & routing)\n│   │   ├── App.css          (Vite boilerplate styles)\n│   │   ├── index.css        (Global design system CSS)\n│   │   ├── main.jsx         (Vite entry point)\n│   │   └── components/\n│   │       ├── Dashboard.jsx    (Board manager UI)\n│   │       ├── CanvasBoard.jsx  (Infinite canvas core)\n│   │       ├── Card.jsx         (Card component)\n│   │       └── Toolbar.jsx      (Canvas toolbar)\n│   └── vite.config.js\n├── backend/           (Express + MongoDB API)\n│   ├── server.js      (Express routes)\n│   ├── db.js          (Mongoose models + local fallback)\n│   ├── seed.js        (Sample data seeder)\n│   └── db.json        (Local JSON fallback DB)\n└── package.json</div>\n\n<b>Data Flow:</b>\nFrontend fetches board data via REST API → Renders infinite canvas → User edits cards/connections/drawings → Autosaves back to backend every 15 minutes or on manual save.\n\n<b>Key Design Decisions:</b>\n• No React Router — state-driven view switching (Dashboard ↔ Canvas)\n• CSS-only transform for zoom/pan (no canvas element)\n• Glassmorphism design system with dark theme\n• Dual DB support: MongoDB primary, JSON file fallback',
      tags: ['architecture', 'overview', 'fullstack'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'tech-stack',
      x: 580,
      y: 0,
      width: 420,
      height: 520,
      title: '⚙️ Technology Stack',
      content: '<b>Frontend:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• React 19 (with hooks, no class components)\n• Vite 8 (HMR dev server + production bundler)\n• Lucide React (icon library)\n• html-to-image (PNG export via toPng)\n• Vanilla CSS with CSS custom properties\n• Google Fonts: Outfit + Plus Jakarta Sans</div>\n\n<b>Backend:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Express.js 4 (REST API server)\n• Mongoose 8 (MongoDB ODM with schemas)\n• Node.js crypto (pbkdf2 password hashing)\n• dotenv (environment configuration)\n• Local JSON file fallback (db.json)</div>\n\n<b>External APIs:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Piston API (emkc.org/api/v2/execute)\n  — Remote code execution for 11 languages\n  — Used by both card-level and board-level code sandboxes\n  — Falls back to browser Function() for JS</div>\n\n<b>Dev Tooling:</b>\n• Nodemon for backend hot-reload\n• Vite HMR for instant frontend updates\n• ESM modules throughout (type: "module")',
      tags: ['tech', 'react', 'express', 'vite'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'app-routing',
      x: 1060,
      y: 0,
      width: 420,
      height: 520,
      title: '🔀 App.jsx — State-Driven Routing',
      content: '<b>How Navigation Works:</b>\n\nApp.jsx is the root component. It uses a simple state variable <b>currentBoardId</b> to switch between two views:\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>currentBoardId === null → Show Dashboard\ncurrentBoardId !== null → Show CanvasBoard</div>\n\n<b>State Variables:</b>\n• <b>currentBoardId</b> — null or MongoDB _id string\n• <b>boardPassword</b> — hashed password for authenticated boards\n• <b>forceViewOnly</b> — boolean to lock canvas in read-only mode\n• <b>toasts</b> — array of notification objects {id, message, type}\n\n<b>Toast Notification System:</b>\nGlobal showToast(message, type) function creates ephemeral notifications. Each toast auto-dismisses after 3 seconds using setTimeout.\n\nRendered as a fixed overlay .toast-container with stacked toast elements using .glass styling.\n\n<b>Board Selection Flow:</b>\nDashboard calls onSelectBoard(boardId, password, viewOnly) which sets all three state variables and triggers the CanvasBoard mount.\n\n<b>Back Navigation:</b>\nCanvasBoard calls onBack() which resets currentBoardId to null, unmounting the canvas and remounting the Dashboard.',
      tags: ['routing', 'state', 'navigation'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    // ─────────────────────────────────────────────────────
    //  ROW 1 — BACKEND (y: 580)
    // ─────────────────────────────────────────────────────

    {
      id: 'backend-api',
      x: 0,
      y: 580,
      width: 520,
      height: 600,
      title: '🌐 Backend REST API (server.js)',
      content: '<b>All API Endpoints:</b>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>GET /api/boards</b>\nReturns all boards (metadata only — no card content/images).\nProjects: name, updatedAt, zoom, pan, protectionMode, card IDs/types, connection IDs, drawing tools.\nSorted by updatedAt descending (newest first).</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>GET /api/boards/:id</b>\nReturns full board data including all cards, connections, drawings, code.\nIf protectionMode === \'full\', requires x-board-password header.\nPassword field is stripped from response.</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>POST /api/boards</b>\nCreates new board. Body: { name, password?, protectionMode? }\nPassword is hashed with pbkdf2 before storage.\nReturns board data + hashedPassword for client-side caching.</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>PUT /api/boards/:id</b>\nUpdates board state (cards, connections, drawings, pan, zoom, name, code, language).\nRequires password header for \'full\' or \'partial\' protected boards.\nUses $set to update only provided fields.</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>DELETE /api/boards/:id</b>\nDeletes board permanently. Requires password for protected boards.</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>POST /api/boards/:id/verify</b>\nVerifies password. Returns { success: bool, hashedPassword? }\nUsed by Dashboard unlock flow and CanvasBoard unlock modal.</div>',
      tags: ['api', 'rest', 'express', 'endpoints'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'db-layer',
      x: 580,
      y: 580,
      width: 420,
      height: 600,
      title: '🗄️ Database Layer (db.js)',
      content: '<b>Dual Database Strategy:</b>\nDragg attempts MongoDB first. If connection fails (timeout 3s), it silently falls back to a local <b>db.json</b> file.\n\n<b>Mongoose Schemas:</b>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>BoardSchema:</b>\n• name (String, required)\n• password (String, hashed)\n• protectionMode (enum: none/full/partial)\n• cards ([CardSchema])\n• connections ([ConnectionSchema])\n• drawings ([StrokeSchema])\n• pan ({ x, y })\n• zoom (Number)\n• code, language (board-level sandbox)\n• timestamps: true (auto createdAt/updatedAt)</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>CardSchema:</b>\nid, x, y, width, height, title, content, code, language, tags[], color, type (note/image), imageUrl, drawingDataUrl, cardMode (notes/code/sketch), attachments[], completed, notesFontSize, notesTextColor, notesFontFamily, notesFontWeight, notesFontStyle</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>ConnectionSchema:</b>\nid, fromCardId, fromSide, toCardId, toSide, label</div>\n\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button><b>StrokeSchema:</b>\ntool (pen/ruler), color, thickness, points[{x,y}]</div>\n\n<b>Password Security:</b>\nUses crypto.pbkdf2Sync with salt, 1000 iterations, 64 bytes, sha512.\nverifyPassword() checks both hashed and raw passwords for compatibility.\n\n<b>Local JSON Fallback:</b>\nGenerates random _id strings. Reads/writes db.json synchronously. Mimics Mongoose API surface.',
      tags: ['database', 'mongoose', 'schema', 'security'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'css-design-system',
      x: 1060,
      y: 580,
      width: 420,
      height: 600,
      title: '🎨 CSS Design System (index.css)',
      content: '<b>1920 lines</b> of handwritten CSS. No Tailwind. Pure vanilla CSS with custom properties.\n\n<b>Design Tokens:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>Fonts: Outfit (headings) + Plus Jakarta Sans (body)\nBackground: #0a0a0c (near-black)\nCard BG: rgba(22,22,28,0.9)\nToolbar BG: rgba(18,18,24,0.85)\nBorder: rgba(255,255,255,0.08)\nText: #f4f4f7 (main), #8b8e9f (muted)</div>\n\n<b>6 Accent Colors (each has hex + rgb):</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Slate:   #475569\n• Indigo:  #6366f1\n• Cyan:    #06b6d4\n• Emerald: #10b981\n• Amber:   #f59e0b\n• Rose:    #f43f5e</div>\n\n<b>Glassmorphism:</b>\nTwo glass classes — .glass and .glass-toolbar with different blur levels (16px vs 20px), subtle borders, and deep box-shadows.\n\n<b>Card Themes:</b>\nEach accent has a .card-theme-{color} class with:\n• Custom background tint\n• Border color (25% opacity)\n• Selected state with glow shadow\n• --theme-accent-color and --theme-shadow-color\n\n<b>Animations:</b>\nfadeInUp, fadeInDown, modalScaleIn, dashRotation, blinkOutline, saveAlertGlow — all defined as @keyframes.\n\n<b>Responsive:</b>\nTouch-action: none on canvas-container. Grid-based dashboard layout with auto-fill columns.',
      tags: ['css', 'design', 'glassmorphism', 'theme'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    // ─────────────────────────────────────────────────────
    //  ROW 2 — DASHBOARD FEATURES (y: 1240)
    // ─────────────────────────────────────────────────────

    {
      id: 'dashboard-main',
      x: 0,
      y: 1240,
      width: 520,
      height: 560,
      title: '📋 Dashboard — Board Manager',
      content: '<b>Dashboard.jsx (920 lines)</b> — The home screen for managing all whiteboards.\n\n<b>Board Listing:</b>\n• Fetches all boards on mount via GET /api/boards\n• Displays as a responsive CSS Grid (auto-fill, minmax 280px)\n• Each board card shows: name, card count, connection count, drawing count, image count, protection badge, last modified date\n• Sorted by most recently updated\n• Loading spinner while fetching\n\n<b>Create Board Modal:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>Fields:\n• Board Name (required text input)\n• Password (optional)\n• Protection Mode dropdown:\n  - None: No password needed\n  - Partial: View-only without password, edit with password\n  - Full: Cannot even view without password</div>\n\n<b>Board Card Interactions:</b>\n• Click → Opens board (with auto-password-verify for full-lock boards)\n• Eye icon → Opens board in forced View-Only mode\n• Trash icon → Opens delete confirmation modal (requires password for protected boards)\n\n<b>Smart Password Caching:</b>\nHashed passwords are saved to localStorage as dragg-board-pass-{boardId}. On next visit, the app auto-verifies the saved hash without prompting.',
      tags: ['dashboard', 'boards', 'management'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'dashboard-import',
      x: 580,
      y: 1240,
      width: 420,
      height: 560,
      title: '📥 Notes File Import System',
      content: '<b>Structured Text Import (.txt / .md)</b>\n\nDashboard has an "Import Notes" button that accepts text files and auto-generates boards with cards.\n\n<b>Parsing Algorithm (parseNotesText):</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. Splits file into lines\n2. Lines starting with # create new cards (title = heading text)\n3. Lines inside code blocks → card.code + cardMode=\'code\'\n4. Lines starting with "Tags:" → parsed into card.tags array\n5. All other lines → appended to card.content\n6. Cards without headings → auto-create "Introduction" card</div>\n\n<b>Auto-Layout:</b>\nCards are positioned horizontally with 360px spacing:\n  cardIndex * 360 on x-axis, y=150\n\n<b>Auto-Coloring:</b>\nCards cycle through [slate, indigo, cyan, emerald, amber, rose] using modulo indexing.\n\n<b>Auto-Connections:</b>\nAfter parsing, sequential connection wires are auto-created:\nCard[0] → Card[1] → Card[2] → ... (right-to-left ports)\n\n<b>API Flow:</b>\n1. POST /api/boards (create empty board with parsed name)\n2. PUT /api/boards/:id (populate with parsed cards + connections)\n3. Reload board list via fetchBoards()\n\n<b>File name becomes board name:</b>\n"my_study_notes.txt" → "my study notes"',
      tags: ['import', 'parser', 'markdown', 'text'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'dashboard-keybindings',
      x: 1060,
      y: 1240,
      width: 420,
      height: 560,
      title: '⌨️ Customizable Keybindings',
      content: '<b>Settings Panel in Dashboard</b>\n\nAccessible via the gear icon in the Dashboard header.\n\n<b>Remappable Actions (9 total):</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Pan Up (default: W)\n• Pan Down (default: S)\n• Pan Left (default: A)\n• Pan Right (default: D)\n• Zoom In (default: =)\n• Zoom Out (default: -)\n• Select Mode (default: V)\n• Connector Mode (default: C)\n• Eraser Mode (default: E)</div>\n\n<b>How Rebinding Works:</b>\n1. User clicks "Rebind" button next to an action\n2. Button text changes to "Press any key..."\n3. activeBindingKey state is set\n4. A global keydown listener captures the next keypress\n5. New binding is saved: { key, code, label }\n6. Persisted to localStorage as \'dragg-keybindings\'\n7. Pressing Escape cancels the rebind\n\n<b>Implementation Details:</b>\n• Global keydown listener uses capture: true to intercept before other handlers\n• Keybindings are loaded from localStorage on mount with a lazy useState initializer\n• Both CanvasBoard and Dashboard share the same keybinding schema\n• Each binding stores both key (display) and code (matching)',
      tags: ['keyboard', 'shortcuts', 'settings', 'customization'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    // ─────────────────────────────────────────────────────
    //  ROW 3 — CANVAS CORE (y: 1860)
    // ─────────────────────────────────────────────────────

    {
      id: 'canvas-viewport',
      x: 0,
      y: 1860,
      width: 520,
      height: 620,
      title: '🔭 Infinite Canvas — Viewport System',
      content: '<b>CanvasBoard.jsx (~1936 lines)</b> — The core infinite whiteboard.\n\n<b>How the Infinite Canvas Works:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>The canvas uses CSS transforms, NOT an HTML5 canvas element.\n\nOuter container: .canvas-container (position: relative, overflow: hidden)\nInner layer: .canvas-content (position: absolute, transform-origin: 0 0)\n\nTransform applied:\n  translate(pan.x px, pan.y px) scale(zoom)\n\nThis makes the entire content layer pan and zoom via CSS, while the container clips it.</div>\n\n<b>Pan State:</b> { x: number, y: number } — pixel offset of the content layer\n<b>Zoom State:</b> number (range: 0.15 to 3.0)\n\n<b>Coordinate Conversion:</b>\nscreenToCanvas(clientX, clientY) converts mouse/touch screen coordinates to canvas-space coordinates:\n  x = (clientX - rect.left - pan.x) / zoom\n  y = (clientY - rect.top - pan.y) / zoom\n\n<b>Grid Background:</b>\nDot grid using CSS radial-gradient. Grid scales with zoom: backgroundSize = 40*zoom px. Grid translates with pan: backgroundPosition = pan.x, pan.y\n\n<b>Mouse Panning:</b>\nLeft-click on background → starts pan. Tracks startX/startY offset, updates pan on mousemove. Uses isPanningRef to avoid state re-renders.\n\n<b>Wheel Zoom (cursor-centered):</b>\nCalculates canvas-space point under cursor, applies zoom factor, then repositions pan so the point stays under cursor.\nzoomIntensity = 0.08. Event listener uses { passive: false } to allow preventDefault().',
      tags: ['canvas', 'viewport', 'zoom', 'pan', 'transform'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'canvas-touch',
      x: 580,
      y: 1860,
      width: 420,
      height: 620,
      title: '📱 Touch Gesture Support',
      content: '<b>Full tablet/mobile touch navigation</b>\n\nWorks in both View Mode and Edit Mode. Designed for reading notes on tablets while traveling.\n\n<b>Touch Architecture:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>touchStateRef = useRef({\n  isInteracting: false,\n  touches: [],\n  startPan: { x, y },\n  startZoom: number,\n  startDistance: number,\n  startCenter: { x, y }\n})</div>\n\n<b>Single-Finger Pan:</b>\n• Touch down captures initial finger position and current pan\n• Touch move calculates delta (dx, dy) from start\n• Sets pan to startPan + delta\n• Works exactly like sliding a photo\n\n<b>Two-Finger Pinch-to-Zoom:</b>\n• Calculates distance between two touches\n• Compares current distance to startDistance\n• factor = currentDistance / startDistance\n• newZoom = startZoom * factor (clamped 0.15 to 3.0)\n• Zoom centers on the midpoint between fingers\n\n<b>Smooth Transition (Pinch → Pan):</b>\nWhen user lifts one finger during pinch, handleTouchEnd detects remaining single touch and resets startPan to current pan, allowing seamless continuation as single-finger pan.\n\n<b>CSS Requirement:</b>\n.canvas-container { touch-action: none; }\n\n<b>Event Binding:</b>\nUses ref-callback pattern. Bound with { passive: false }.\n\n<b>Interactive Element Bypass:</b>\nTouch events are ignored when targeting buttons, inputs, contenteditable, toolbars, outline panel, or code panel.',
      tags: ['touch', 'mobile', 'tablet', 'gestures', 'pinch'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'canvas-tools',
      x: 1060,
      y: 1860,
      width: 420,
      height: 620,
      title: '🛠️ Tool Modes & Toolbar',
      content: '<b>5 Tool Modes:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. <b>Select (V)</b> — Default. Click cards to select, drag to move, drag background to pan.\n2. <b>Connector (C)</b> — Drag from any card to another to create bezier connections.\n3. <b>Pen</b> — Freehand drawing on the canvas. Supports custom color and thickness.\n4. <b>Ruler</b> — Straight-line drawing tool (first point to current point).\n5. <b>Eraser (E)</b> — Drag over canvas strokes to erase them (radius-based hit detection).</div>\n\n<b>Toolbar.jsx (201 lines):</b>\nFloating glass toolbar at the bottom of the canvas.\n\n<b>Toolbar Groups (separated by dividers):</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Navigation: Home (back to Dashboard)\n• Mode Tools: Select, Connector, Eraser (active state highlight)\n• Creation: + Card button, Upload Image button\n• Viewport: Zoom Out, Zoom % indicator, Zoom In, Recenter, Toggle Grid\n• Actions: Export PNG, Clear Board (trash icon)</div>\n\n<b>Pen Settings Panel:</b>\nWhen pen/ruler mode is active, a floating panel appears with:\n• Color picker (6 presets + custom hex input)\n• Thickness slider (1-20px, stepped by 1)\n• Current mode label (Freehand/Ruler)\n\n<b>View-Only Toolbar:</b>\nWhen isViewOnly is true, toolbar is rendered with grayscale filter, 40% opacity, and all actions are blocked with toast warnings.\n\n<b>Image Upload:</b>\nUses a hidden file input. FileReader reads as DataURL (base64). Creates a 300x220 image card at viewport center.',
      tags: ['toolbar', 'modes', 'tools', 'pen', 'eraser'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    // ─────────────────────────────────────────────────────
    //  ROW 4 — CARD FEATURES (y: 2540)
    // ─────────────────────────────────────────────────────

    {
      id: 'card-system',
      x: 0,
      y: 2540,
      width: 520,
      height: 600,
      title: '🃏 Card System — Core Component',
      content: '<b>Card.jsx (1421 lines)</b> — The most complex component.\n\n<b>Card Types:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. <b>Note Card</b> (type: \'note\') — Multi-tab card with Notes, Sketch, and Files tabs\n2. <b>Image Card</b> (type: \'image\') — Displays uploaded image with title</div>\n\n<b>Card Properties:</b>\nid, x, y, width, height, title, content, code, language, tags[], color, type, imageUrl, drawingDataUrl, cardMode, attachments[], completed, notesFontSize, notesTextColor, notesFontFamily, notesFontWeight, notesFontStyle\n\n<b>Drag & Move:</b>\n• mousedown on card header or body → starts drag\n• Tracks clientStartX/Y and card startX/startY\n• Delta is divided by zoom for scale-corrected movement:\n  newX = startX + dx / zoom\n• Interactive elements (inputs, textareas, buttons, canvas) are excluded from drag\n\n<b>8-Way Resize:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>8 resize handles positioned at corners and edges:\n  tl, tr, bl, br, t, r, b, l\nEach handle has directional logic:\n• \'r\' → width grows with mouse\n• \'l\' → width shrinks, x moves right\n• \'b\' → height grows\n• \'t\' → height shrinks, y moves down\nMinimum: 220px width, 160px height\nAll deltas are zoom-corrected (divided by zoom)</div>\n\n<b>Selection & Z-Index:</b>\nSelected cards get z-index: 20 (vs default 10). Clicking card calls onSelect(card.id).',
      tags: ['card', 'component', 'drag', 'resize'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'card-notes-tab',
      x: 580,
      y: 2540,
      width: 420,
      height: 600,
      title: '📝 Notes Tab — Rich Text Editor',
      content: '<b>ContentEditable Rich Text Editor</b>\n\nEach note card has a full-featured rich text editor built on contentEditable.\n\n<b>Format Bar Controls:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Font Family: Sans-Serif, Serif, Monospace\n• Font Size: 12px to 32px (11 options)\n• Text Color: White, Cyan, Emerald, Amber, Rose\n• Bold (B) — uses document.execCommand(\'bold\')\n• Italic (I) — uses document.execCommand(\'italic\')\n• Underline (U) — uses document.execCommand(\'underline\')\n• Container Box — wraps selection in styled callout box</div>\n\n<b>Two Formatting Modes:</b>\n1. <b>Selection-based:</b> When text is selected, formatting applies to selection only\n2. <b>Global:</b> When no text is selected, formatting sets card-level properties\n\n<b>Custom Span Style Application:</b>\napplySpanStyle(styleName, styleValue):\n1. Extracts selected content as DocumentFragment\n2. Cleans existing styles of same type from fragment\n3. Wraps in new span with style\n4. Inserts back into range\n\n<b>Container Box (Callout):</b>\nCreates a .notes-callout-box div with:\n• Delete button at top-right\n• Styled border, background, backdrop-filter\n• Backspace in empty callout removes it\n\n<b>Selection Persistence:</b>\nsaveSelection() / restoreSelection() preserve cursor position across format bar clicks.',
      tags: ['editor', 'rich-text', 'formatting', 'contenteditable'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'card-code-tab',
      x: 1060,
      y: 2540,
      width: 420,
      height: 600,
      title: '💻 Code Sandbox (Card & Board Level)',
      content: '<b>Two Code Sandboxes:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. <b>Card-level:</b> Each card has a "Code" tab with its own editor\n2. <b>Board-level:</b> Global "Sandbox" panel (split-screen right panel)</div>\n\n<b>Supported Languages (11):</b>\nJavaScript (Node 18), TypeScript 5, Python 3, C++, Java 15, Go, Rust, C#, Ruby, PHP 8, Bash\n\n<b>Execution Flow:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. POST to Piston API (emkc.org/api/v2/execute)\n   Body: { language, version, files: [{ name, content }] }\n2. Parse response: data.run.stdout / stderr / code\n3. Display in console output area\n\nIf Piston API is unreachable AND language is JavaScript:\n  → Falls back to browser-side execution\n  → Captures console.log/error/warn/time/timeEnd\n  → Runs via new Function(code)\n  → Restores original console methods after</div>\n\n<b>Code Editor Features:</b>\n• Monospace font (Courier New)\n• Tab key inserts 2 spaces\n• Language-specific placeholder code\n• Run button with loading state\n• Console output panel with error coloring\n• Clear console button\n\n<b>Board-Level Sandbox:</b>\nOpens as a 450px split panel on the right. Has its own language selector, code textarea, run button, and console. Mutually exclusive with Outline panel.',
      tags: ['code', 'sandbox', 'compiler', 'piston', 'execution'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    // ─────────────────────────────────────────────────────
    //  ROW 5 — MORE CARD FEATURES (y: 3200)
    // ─────────────────────────────────────────────────────

    {
      id: 'card-sketch-tab',
      x: 0,
      y: 3200,
      width: 420,
      height: 480,
      title: '🖌️ Sketch Tab — Mini Drawing Canvas',
      content: '<b>Per-Card HTML5 Canvas Drawing</b>\n\nEach note card has a Sketch tab with a real canvas element for freehand drawing.\n\n<b>Drawing Tools:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Pencil — Freehand drawing with color selection\n• Eraser — Uses globalCompositeOperation = \'destination-out\'</div>\n\n<b>Colors:</b> White, Rose, Emerald, Indigo (4 presets)\n\n<b>How Drawing Works:</b>\n1. mouseDown → sets isDrawingRef = true, captures position\n2. mouseMove → draws line from lastCoords to current position\n3. mouseUp/Leave → saves canvas as dataURL to card.drawingDataUrl\n\n<b>Canvas Sizing:</b>\nCanvas dimensions sync with card CSS dimensions via redrawSketch():\n  canvas.width = rect.width\n  canvas.height = rect.height\n\n<b>Data Persistence:</b>\nDrawing is saved as base64 PNG via canvas.toDataURL(). On re-mount, the saved dataURL is loaded back as an Image and drawn onto the canvas.\n\n<b>Clear Sketch:</b>\nctx.clearRect() + sets drawingDataUrl to empty string.\n\n<b>View-Only:</b>\nDrawing is disabled but saved sketches are still visible.',
      tags: ['sketch', 'canvas', 'drawing', 'freehand'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'card-attachments',
      x: 480,
      y: 3200,
      width: 420,
      height: 480,
      title: '📎 Attachments Tab — File Manager',
      content: '<b>Per-Card File Attachment System</b>\n\nEach note card has a "Files" tab for attaching documents.\n\n<b>Supported Files:</b>\nPDF, images, Markdown, text — any file type accepted.\n\n<b>Size Limit:</b> 10MB per file (enforced client-side)\n\n<b>Storage:</b>\nFiles are read as base64 DataURL via FileReader.readAsDataURL() and stored in the card\'s attachments array:\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>{\n  name: "document.pdf",\n  mimeType: "application/pdf",\n  size: 45000,\n  dataUrl: "data:application/pdf;base64,..."\n}</div>\n\n<b>UI Display:</b>\n• File icon based on type (Image, Markdown, PDF, Other)\n• File name (truncated with title tooltip)\n• File size in KB\n• Download button (creates anchor with dataUrl href)\n• Delete button (removes from array by index)\n\n<b>Empty State:</b>\n"No attachments on this card." placeholder text.\n\n<b>View-Only:</b>\nDownloading attachments works. Add/delete buttons are hidden.',
      tags: ['attachments', 'files', 'upload', 'download'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'card-extras',
      x: 960,
      y: 3200,
      width: 420,
      height: 480,
      title: '🏷️ Tags, Colors & Completion',
      content: '<b>Tag System:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Click "+ tag" to open inline input\n• Submit via Enter or blur\n• Duplicate tags are prevented\n• Tags render as small badges below content\n• Each tag has a delete button\n• Tags are stored as string array: card.tags[]</div>\n\n<b>Color Picker:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• 6 preset color dots (slate, indigo, cyan, emerald, amber, rose)\n• Custom hex color picker (input type="color")\n• Custom hex colors get a gradient background treatment\n• Color picker toggles via Palette icon button\n• Each color maps to a CSS theme class: .card-theme-{color}</div>\n\n<b>Completion Toggle:</b>\n• Check mark button in card header\n• Toggles card.completed boolean\n• Completed cards get a .completed CSS class\n• Visual dimming and checkmark color change (emerald when active)\n\n<b>Card Title:</b>\n• Inline text input in card header\n• readOnly when isViewOnly\n\n<b>Quick Connect Button:</b>\nLink icon in card header. mouseDown starts a connection drag from the card\'s right port.\n\n<b>Double-Click Focus:</b>\nDouble-clicking a card triggers handleFocusOnCard which animates the viewport to center and zoom into that card with smooth easing.',
      tags: ['tags', 'colors', 'completion', 'theme'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    // ─────────────────────────────────────────────────────
    //  ROW 6 — CONNECTIONS, DRAWINGS, SAVE (y: 3740)
    // ─────────────────────────────────────────────────────

    {
      id: 'connections-system',
      x: 0,
      y: 3740,
      width: 420,
      height: 520,
      title: '🔗 Connection System — Bezier Curves',
      content: '<b>Card-to-Card Connection Wires</b>\n\n<b>Connection Data:</b>\n{ id, fromCardId, fromSide, toCardId, toSide, label }\nSides: \'top\' | \'right\' | \'bottom\' | \'left\'\n\n<b>How Connections Are Created:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. In Connector mode: mouseDown on any card starts a draft\n2. Draft connection tracks cursor as user drags\n3. On mouseUp: checks if cursor is over another card\n4. If target found → uses getClosestSide() to pick best port\n5. Duplicate check prevents same port-pair connections\n6. New connection added to connections[] state</div>\n\n<b>SVG Bezier Path Generation (makeCurvePath):</b>\nUses cubic bezier curves (C command):\n• Control points offset from start/end based on port side\n• Offset = min(120, max(40, max(dx,dy) * 0.4))\n• Creates smooth flowing curves between cards\n\n<b>Gradient Coloring:</b>\nEach connection line uses an SVG linearGradient that blends the accent colors of the two connected cards.\n\n<b>Delete Connection:</b>\nSingle click on the line → deletes it immediately. Hover highlights in rose color with glow effect.\n\n<b>Port Coordinates:</b>\ngetPortCoords(card, side) calculates center point of each card edge.',
      tags: ['connections', 'bezier', 'svg', 'graph'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'drawing-system',
      x: 480,
      y: 3740,
      width: 420,
      height: 520,
      title: '✏️ Canvas Drawing System',
      content: '<b>Freehand & Ruler Drawing on the Infinite Canvas</b>\n\nUnlike card sketch (which uses HTML5 Canvas), canvas drawings use SVG paths rendered inside the connections-svg layer.\n\n<b>Drawing Modes:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• <b>Pen (Freehand):</b> Records all mouse positions as points array\n• <b>Ruler:</b> Only stores [startPoint, currentPoint] — always a straight line\n• <b>Shift key:</b> Holding Shift in pen mode forces ruler behavior</div>\n\n<b>Stroke Data Structure:</b>\n{ tool, color, thickness, points: [{ x, y }] }\n\n<b>Drawing Flow:</b>\n1. mouseDown in pen/ruler mode → creates activeStroke\n2. mouseMove → appends points (pen) or replaces endpoint (ruler)\n3. mouseUp → commits activeStroke to drawings[] array\n\n<b>SVG Rendering:</b>\ngetStrokePathData() converts points to SVG path:\n  M x0 y0 L x1 y1 L x2 y2 ...\nRendered with strokeLinecap="round" and strokeLinejoin="round".\n\n<b>Eraser:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>Radius-based hit detection:\n• eraseRadius = 15 / zoom (scales with zoom level)\n• Checks each stroke\'s points: dx*dx + dy*dy < radius*radius\n• Uses squared distance (no Math.sqrt) for performance\n• Removes entire stroke if any point is hit</div>\n\n<b>Pen Settings Panel:</b>\nColor: 6 presets + custom hex picker. Thickness: 1-20px slider.',
      tags: ['drawing', 'pen', 'ruler', 'eraser', 'svg'],
      color: 'rose',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'save-system',
      x: 960,
      y: 3740,
      width: 420,
      height: 520,
      title: '💾 Save System & Status Tracking',
      content: '<b>Multi-Layer Save Architecture</b>\n\n<b>Save Triggers:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. <b>Autosave:</b> Every 15 minutes via setInterval\n2. <b>Manual Save:</b> Click "Save" button in status indicator\n3. <b>No save on every keystroke</b> — deliberate design choice</div>\n\n<b>Save Status States:</b>\n• \'saved\' — Green dot, "Last saved: X mins ago"\n• \'saving\' — Amber dot, "Saving..."\n• \'error\' — Red dot, "Error (Offline)"\n\n<b>Unsaved Changes Tracking:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• hasUnsavedChanges — boolean, set true on any edit\n• unsavedSinceRef — timestamp of first unsaved change\n• shouldGlowAlert — true if unsaved for >5 minutes\n• Alert glow adds red border + animation to save indicator</div>\n\n<b>Relative Time Display:</b>\ngetRelativeTimeString() shows "just now", "3 mins ago", "1 hour ago". Updates every 5 seconds.\n\n<b>latestDataRef Pattern:</b>\nA ref that always mirrors the latest state values. This avoids stale closures in the autosave interval.\n\n<b>Save API Call:</b>\nPUT /api/boards/:id with full board state. On success: resets hasUnsavedChanges, updates lastSavedTimestamp.\n\n<b>View-Only Guard:</b>\nhandleSaveBoard() returns immediately if isViewOnly.',
      tags: ['save', 'autosave', 'status', 'persistence'],
      color: 'indigo',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    // ─────────────────────────────────────────────────────
    //  ROW 7 — NAVIGATION, SECURITY, EXPORT (y: 4320)
    // ─────────────────────────────────────────────────────

    {
      id: 'outline-birds-eye',
      x: 0,
      y: 4320,
      width: 420,
      height: 500,
      title: '🗺️ Outline & Bird\'s Eye View',
      content: '<b>Canvas Outline Sidebar:</b>\nFloating panel (320px wide) listing all cards as a searchable table of contents.\n\n<b>Features:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>• Search input filters cards by title and content\n• Each item shows emoji icon (Note / Image)\n• Click item → animated focus on that card\n• Active card highlighted with cyan border\n• Cards without title show content preview (35 chars max)\n• Empty state: "No topics created on canvas yet."</div>\n\n<b>handleFocusOnCard Animation:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>Uses requestAnimationFrame for smooth 400ms animation:\n1. Calculates target zoom to fit card in 85% viewport\n2. Interpolates zoom and pan using quadratic ease-in-out\n3. On completion: selects card + triggers 1.5s blink animation\n4. blinkingCardId → adds .blinking CSS class → blinkOutline keyframes</div>\n\n<b>Bird\'s Eye View:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>Calculates bounding box of ALL cards:\n  minX, minY, maxX, maxY (with 80px padding)\nThen zooms/pans to fit everything visible.\nUses same 400ms eased animation.\nIf no cards exist → resets to zoom:1, pan:(100,100).</div>\n\n<b>Toggle Behavior:</b>\nOutline and Code Sandbox are mutually exclusive — opening one closes the other.',
      tags: ['outline', 'navigation', 'birds-eye', 'search'],
      color: 'cyan',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'security-system',
      x: 480,
      y: 4320,
      width: 420,
      height: 500,
      title: '🔒 Security & Protection System',
      content: '<b>3 Protection Modes:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>1. <b>None:</b> No password. Anyone can view and edit.\n2. <b>Partial:</b> Anyone can view (read-only). Password needed to edit.\n3. <b>Full:</b> Password needed to even view the board content.</div>\n\n<b>Password Flow (Partial):</b>\n• Board loads normally but isViewOnly = true\n• "View Mode" badge + Lock icon displayed\n• Clicking badge opens unlock modal\n• Password verified via POST /api/boards/:id/verify\n• On success: localPassword set, isViewOnly becomes false\n• Hashed password saved to localStorage\n\n<b>Password Flow (Full):</b>\n• Dashboard shows unlock modal before entering board\n• After verification: board loads with full access\n• Saved hash allows auto-entry on future visits\n\n<b>View-Only Mode Guards:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>isViewOnly blocks:\n• Adding/deleting/editing cards\n• Creating/deleting connections\n• Drawing/erasing strokes\n• Clearing board, Saving changes\n• Running code in sandbox, Renaming board\nBut ALLOWS: panning, zooming, touch gestures, outline search, viewing content</div>\n\n<b>forceViewOnly prop:</b>\nDashboard can force a board into view-only mode regardless of password status (via the eye icon).',
      tags: ['security', 'password', 'protection', 'view-only'],
      color: 'emerald',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

    {
      id: 'export-system',
      x: 960,
      y: 4320,
      width: 420,
      height: 500,
      title: '📸 Export & Seeding',
      content: '<b>PNG Export (handleExportPNG):</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>Uses html-to-image library (toPng function):\n1. Hides toolbar, pen panel, save indicator, delete button\n2. Captures containerRef as PNG with bg color #0a0a0c\n3. Creates temporary anchor with download attribute\n4. Triggers click to download\n5. Restores hidden elements\n6. File named: {boardName}_design.png</div>\n\n<b>Seed Scripts:</b>\n<div class="notes-callout-box"><button class="notes-callout-delete" contenteditable="false">×</button>seed.js — Basic sample board\nseed_js_board.js — Full JavaScript study board with:\n  • 40+ cards covering JS concepts\n  • 40+ connections with labels\n  • Custom positioning and sizing\n  • Password-protected (partial mode)\n  • Cards use various colors and modes</div>\n\n<b>How Seed Scripts Work:</b>\n1. Connect to MongoDB via connectDB()\n2. Create board via createBoard(name, password, protectionMode)\n3. Populate via updateBoard(board._id, seedData)\n4. Disconnect and exit\n\n<b>Clear Board:</b>\nCustom confirmation modal with "Wipe Canvas Clean?" prompt. Deletes all cards, connections, and drawings.\n\n<b>Board Deletion (Dashboard):</b>\nCustom modal with password input for protected boards. Calls DELETE /api/boards/:id. Removes localStorage password hash.',
      tags: ['export', 'png', 'seed', 'clear', 'delete'],
      color: 'amber',
      type: 'note',
      cardMode: 'notes',
      notesFontSize: '13px',
      notesTextColor: 'default',
      notesFontFamily: 'sans',
      notesFontWeight: 'normal',
      notesFontStyle: 'normal'
    },

  ],

  connections: [
    { id: 'c1', fromCardId: 'arch-overview', fromSide: 'right', toCardId: 'tech-stack', toSide: 'left', label: '' },
    { id: 'c2', fromCardId: 'tech-stack', fromSide: 'right', toCardId: 'app-routing', toSide: 'left', label: '' },
    { id: 'c3', fromCardId: 'arch-overview', fromSide: 'bottom', toCardId: 'backend-api', toSide: 'top', label: 'Backend' },
    { id: 'c4', fromCardId: 'tech-stack', fromSide: 'bottom', toCardId: 'db-layer', toSide: 'top', label: 'Database' },
    { id: 'c5', fromCardId: 'app-routing', fromSide: 'bottom', toCardId: 'css-design-system', toSide: 'top', label: 'Styling' },
    { id: 'c6', fromCardId: 'backend-api', fromSide: 'right', toCardId: 'db-layer', toSide: 'left', label: '' },
    { id: 'c7', fromCardId: 'db-layer', fromSide: 'right', toCardId: 'css-design-system', toSide: 'left', label: '' },
    { id: 'c8', fromCardId: 'backend-api', fromSide: 'bottom', toCardId: 'dashboard-main', toSide: 'top', label: 'Dashboard' },
    { id: 'c9', fromCardId: 'db-layer', fromSide: 'bottom', toCardId: 'dashboard-import', toSide: 'top', label: 'Import' },
    { id: 'c10', fromCardId: 'css-design-system', fromSide: 'bottom', toCardId: 'dashboard-keybindings', toSide: 'top', label: 'Settings' },
    { id: 'c11', fromCardId: 'dashboard-main', fromSide: 'right', toCardId: 'dashboard-import', toSide: 'left', label: '' },
    { id: 'c12', fromCardId: 'dashboard-import', fromSide: 'right', toCardId: 'dashboard-keybindings', toSide: 'left', label: '' },
    { id: 'c13', fromCardId: 'dashboard-main', fromSide: 'bottom', toCardId: 'canvas-viewport', toSide: 'top', label: 'Canvas' },
    { id: 'c14', fromCardId: 'dashboard-import', fromSide: 'bottom', toCardId: 'canvas-touch', toSide: 'top', label: 'Touch' },
    { id: 'c15', fromCardId: 'dashboard-keybindings', fromSide: 'bottom', toCardId: 'canvas-tools', toSide: 'top', label: 'Tools' },
    { id: 'c16', fromCardId: 'canvas-viewport', fromSide: 'right', toCardId: 'canvas-touch', toSide: 'left', label: '' },
    { id: 'c17', fromCardId: 'canvas-touch', fromSide: 'right', toCardId: 'canvas-tools', toSide: 'left', label: '' },
    { id: 'c18', fromCardId: 'canvas-viewport', fromSide: 'bottom', toCardId: 'card-system', toSide: 'top', label: 'Cards' },
    { id: 'c19', fromCardId: 'canvas-touch', fromSide: 'bottom', toCardId: 'card-notes-tab', toSide: 'top', label: 'Notes' },
    { id: 'c20', fromCardId: 'canvas-tools', fromSide: 'bottom', toCardId: 'card-code-tab', toSide: 'top', label: 'Code' },
    { id: 'c21', fromCardId: 'card-system', fromSide: 'right', toCardId: 'card-notes-tab', toSide: 'left', label: '' },
    { id: 'c22', fromCardId: 'card-notes-tab', fromSide: 'right', toCardId: 'card-code-tab', toSide: 'left', label: '' },
    { id: 'c23', fromCardId: 'card-system', fromSide: 'bottom', toCardId: 'card-sketch-tab', toSide: 'top', label: 'Sketch' },
    { id: 'c24', fromCardId: 'card-notes-tab', fromSide: 'bottom', toCardId: 'card-attachments', toSide: 'top', label: 'Files' },
    { id: 'c25', fromCardId: 'card-code-tab', fromSide: 'bottom', toCardId: 'card-extras', toSide: 'top', label: 'Tags' },
    { id: 'c26', fromCardId: 'card-sketch-tab', fromSide: 'right', toCardId: 'card-attachments', toSide: 'left', label: '' },
    { id: 'c27', fromCardId: 'card-attachments', fromSide: 'right', toCardId: 'card-extras', toSide: 'left', label: '' },
    { id: 'c28', fromCardId: 'card-sketch-tab', fromSide: 'bottom', toCardId: 'connections-system', toSide: 'top', label: 'Connections' },
    { id: 'c29', fromCardId: 'card-attachments', fromSide: 'bottom', toCardId: 'drawing-system', toSide: 'top', label: 'Drawing' },
    { id: 'c30', fromCardId: 'card-extras', fromSide: 'bottom', toCardId: 'save-system', toSide: 'top', label: 'Save' },
    { id: 'c31', fromCardId: 'connections-system', fromSide: 'right', toCardId: 'drawing-system', toSide: 'left', label: '' },
    { id: 'c32', fromCardId: 'drawing-system', fromSide: 'right', toCardId: 'save-system', toSide: 'left', label: '' },
    { id: 'c33', fromCardId: 'connections-system', fromSide: 'bottom', toCardId: 'outline-birds-eye', toSide: 'top', label: 'Nav' },
    { id: 'c34', fromCardId: 'drawing-system', fromSide: 'bottom', toCardId: 'security-system', toSide: 'top', label: 'Security' },
    { id: 'c35', fromCardId: 'save-system', fromSide: 'bottom', toCardId: 'export-system', toSide: 'top', label: 'Export' },
    { id: 'c36', fromCardId: 'outline-birds-eye', fromSide: 'right', toCardId: 'security-system', toSide: 'left', label: '' },
    { id: 'c37', fromCardId: 'security-system', fromSide: 'right', toCardId: 'export-system', toSide: 'left', label: '' },
  ]
};

const runSeeder = async () => {
  console.log('Connecting to database...');
  await connectDB(MONGO_URI);

  try {
    console.log('Creating Dragg Documentation board...');
    const board = await createBoard(seedData.name);
    
    console.log('Populating 21 feature documentation cards + 37 connections...');
    await updateBoard(board._id, seedData);

    console.log('');
    console.log('Successfully created "Dragg - Complete Feature Documentation" board!');
    console.log('   -> ' + seedData.cards.length + ' cards documenting every feature');
    console.log('   -> ' + seedData.connections.length + ' connection wires linking related features');
    console.log('   -> Board zoom set to ' + seedData.zoom + ' for full overview');
    console.log('');
    console.log('Open the app and click on the board to explore!');
  } catch (err) {
    console.error('Failed to seed documentation board:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

runSeeder();
