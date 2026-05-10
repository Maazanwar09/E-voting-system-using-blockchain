import { Request, Response } from 'express';
import Election from '../models/Election';

export const getElections = async (req: Request, res: Response): Promise<void> => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createElection = async (req: any, res: Response): Promise<void> => {
  try {
    const { blockchainId, title, description, startTime, endTime, organization } = req.body;
    
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    let status = 'upcoming';
    
    if (now >= start && now <= end) {
      status = 'ongoing';
    } else if (now > end) {
      status = 'completed';
    }

    const election = await Election.create({
      blockchainId,
      title,
      description,
      organization: organization || 'General',
      status,
      startTime,
      endTime,
      candidates: [],
      createdBy: req.user?.id
    });

    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { electionId } = req.params;
    const { name, details, imageUrl } = req.body;

    const election = await Election.findById(electionId);
    
    if (!election) {
      res.status(404).json({ message: 'Election not found' });
      return;
    }

    election.candidates.push({ name, details, imageUrl });
    await election.save();

    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
