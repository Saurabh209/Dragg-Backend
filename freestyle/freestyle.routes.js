import { Router } from 'express';
import {
  handleGetAllFreestyleBoards,
  handleGetFreestyleBoardById,
  handleCreateFreestyleBoard,
  handleUpdateFreestyleBoard,
  handleDeleteFreestyleBoard,
  handleVerifyFreestyleBoardPassword
} from './freestyle.controller.js';
import { validateFreestyleBoardData } from './freestyle.middleware.js';

const router = Router();

router.get('/', handleGetAllFreestyleBoards);
router.post('/', validateFreestyleBoardData, handleCreateFreestyleBoard);
router.get('/:id', handleGetFreestyleBoardById);
router.post('/:id/verify', handleVerifyFreestyleBoardPassword);
router.put('/:id', handleUpdateFreestyleBoard);
router.patch('/:id', handleUpdateFreestyleBoard);
router.delete('/:id', handleDeleteFreestyleBoard);

export default router;
