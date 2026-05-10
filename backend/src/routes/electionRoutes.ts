import express from 'express';
import { getElections, createElection, addCandidate } from '../controllers/electionController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getElections)
  .post(protect, adminOnly, createElection);

router.route('/:electionId/candidates')
  .post(protect, adminOnly, addCandidate);

export default router;
