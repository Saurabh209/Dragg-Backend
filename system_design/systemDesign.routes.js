import { Router } from 'express';
import {
  handleGetAllSystemDesignBoards,
  handleGetSystemDesignBoardById,
  handleCreateSystemDesignBoard,
  handleUpdateSystemDesignBoard,
  handleDeleteSystemDesignBoard
} from './systemDesign.controller.js';
import { validateSystemDesignBoardData } from './systemDesign.middleware.js';

const router = Router();

router.get('/', handleGetAllSystemDesignBoards);
router.post('/', validateSystemDesignBoardData, handleCreateSystemDesignBoard);
router.get('/:id', handleGetSystemDesignBoardById);
router.put('/:id', handleUpdateSystemDesignBoard);
router.patch('/:id', handleUpdateSystemDesignBoard);
router.delete('/:id', handleDeleteSystemDesignBoard);

export default router;
