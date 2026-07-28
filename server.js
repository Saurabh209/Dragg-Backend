import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getBoards, getBoardById, createBoard, updateBoard, patchBoard, deleteBoard, verifyPassword } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI ;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
// Get all boards (metadata list)
app.get('/api/boards', async (req, res) => {
  try {
    const boards = await getBoards();
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Verify board password
app.post('/api/boards/:id/verify', async (req, res) => {
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
});

// Get single board full details
app.get('/api/boards/:id', async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if fully password protected
    if (board.protectionMode === 'full') {
      const clientPassword = req.headers['x-board-password'];
      if (!verifyPassword(clientPassword, board.password)) {
        return res.status(401).json({ error: 'Password required', protectionMode: 'full' });
      }
    }

    const boardData = board.toObject ? board.toObject() : { ...board };
    delete boardData.password;

    res.json(boardData);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board details' });
  }
});

// Create new board
app.post('/api/boards', async (req, res) => {
  try {
    const { name, password, protectionMode, preset } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }
    const newBoard = await createBoard(name, password, protectionMode, preset);
    
    const boardData = newBoard.toObject ? newBoard.toObject() : { ...newBoard };
    const hashedPassword = boardData.password;
    delete boardData.password;

    res.status(201).json({ ...boardData, hashedPassword });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update board state full (cards, connections, pan, zoom, name)
app.put('/api/boards/:id', async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.protectionMode === 'full' || board.protectionMode === 'partial') {
      const clientPassword = req.headers['x-board-password'];
      if (!verifyPassword(clientPassword, board.password)) {
        return res.status(401).json({ error: 'Password required to modify board' });
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
});

// Partial (Delta) update board state
app.patch('/api/boards/:id', async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.protectionMode === 'full' || board.protectionMode === 'partial') {
      const clientPassword = req.headers['x-board-password'];
      if (!verifyPassword(clientPassword, board.password)) {
        return res.status(401).json({ error: 'Password required to modify board' });
      }
    }

    const updatedBoard = await patchBoard(req.params.id, req.body);
    
    const boardData = updatedBoard.toObject ? updatedBoard.toObject() : { ...updatedBoard };
    delete boardData.password;

    res.json(boardData);
  } catch (error) {
    console.error('Error patching board:', error);
    res.status(500).json({ error: 'Failed to patch board' });
  }
});

// Delete board
app.delete('/api/boards/:id', async (req, res) => {
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
    
    const boardData = deletedBoard.toObject ? deletedBoard.toObject() : { ...deletedBoard };
    delete boardData.password;

    res.json({ message: 'Board deleted successfully', board: boardData });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

// Start DB connection then start Server
const startServer = async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
