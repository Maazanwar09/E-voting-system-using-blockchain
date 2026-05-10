import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ethers } from 'ethers';

// Hardhat local node Account 0 private key for admin actions
const ADMIN_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const VOTING_CONTRACT_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const VOTING_ABI = [
  "function whitelistVoter(address _voter) public"
];

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`Registering user: ${email}`);

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'voter',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ email });
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    console.log(`User found: ${!!user}, Password match: ${isMatch}`);

    if (user && isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateWallet = async (req: any, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress },
      { new: true }
    ).select('-password');
    
    // Whitelist the voter on the smart contract
    if (walletAddress) {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, wallet);
        
        console.log(`Whitelisting wallet on blockchain: ${walletAddress}`);
        const tx = await contract.whitelistVoter(walletAddress);
        await tx.wait();
        console.log(`Successfully whitelisted: ${walletAddress}`);
      } catch (bcError) {
        console.error("Blockchain whitelist error:", bcError);
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const promoteAdmin = async (req: any, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    console.log(`Promoting user to admin: ${email}`);
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
