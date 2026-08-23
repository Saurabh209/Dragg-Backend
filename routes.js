import { Router } from 'express';
import {
  handleGetAllBoards,
  handleVerifyPassword,
  handleGetBoardById,
  handleCreateBoard,
  handleUpdateBoard,
  handlePatchBoard,
  handleDeleteBoard
} from './controller.js';

const router = Router();

// Get all boards (metadata list)
router.get('/', handleGetAllBoards);

// Create new board
router.post('/', handleCreateBoard);

// Verify board password
router.post('/:id/verify', handleVerifyPassword);

// Get single board full details
router.get('/:id', handleGetBoardById);

// Update board state full
router.put('/:id', handleUpdateBoard);

// Partial (Delta) update board state
router.patch('/:id', handlePatchBoard);

// Delete board
router.delete('/:id', handleDeleteBoard);

export default router;
