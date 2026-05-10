import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from '../utils/constants';

interface Candidate {
  id: number;
  name: string;
  details: string;
  imageUrl: string;
  voteCount: number;
  color?: string;
}

interface Election {
  id: number;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  totalVotes: number;
}

const ResultsPage = () => {
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams();
  const [isVoting, setIsVoting] = useState(false);
  
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [electionStatus, setElectionStatus] = useState<'Upcoming' | 'Live' | 'Ended'>('Upcoming');

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Direct provider for reliability
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);

      const electionId = Number(id) || 1;
      const electionData = await contract.getElection(electionId);
      const candidatesData = await contract.getAllCandidates(electionId);

      if (!electionData || !electionData.title) {
        throw new Error("Election data not found on blockchain");
      }

      const formattedElection = {
        id: Number(electionData.id || electionId),
        title: electionData.title,
        description: electionData.description || "",
        startTime: Number(electionData.startTime || 0),
        endTime: Number(electionData.endTime || 0),
        isActive: electionData.isActive,
        totalVotes: (candidatesData || []).reduce((acc: number, curr: any) => acc + Number(curr.voteCount || 0), 0)
      };

      const formattedCandidates = (candidatesData || []).map((c: any, index: number) => ({
        id: Number(c.id || index),
        name: c.name || "Unknown Candidate",
        details: c.details || "",
        imageUrl: c.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name || index}`,
        voteCount: Number(c.voteCount || 0),
        color: colors[index % colors.length]
      }));

      setElection(formattedElection);
      setCandidates(formattedCandidates);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setError(err.message || "Failed to connect to blockchain");
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (candidateId: number) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");
      setIsVoting(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

      const electionId = Number(id) || 1;
      const tx = await contract.vote(electionId, candidateId);
      
      console.log("Voting transaction sent:", tx.hash);
      await tx.wait();
      
      window.alert("Vote cast successfully! 🗳️");
      fetchResults(); // Refresh data
    } catch (err: any) {
      console.error("Voting error:", err);
      window.alert("Voting Failed: " + (err.reason || err.message));
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  useEffect(() => {
    if (!election) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      
      if (now < election.startTime) {
        setElectionStatus('Upcoming');
        const diff = election.startTime - now;
        setTimeRemaining(`Starts in ${formatTime(diff)}`);
      } else if (now >= election.startTime && now <= election.endTime) {
        setElectionStatus('Live');
        const diff = election.endTime - now;
        setTimeRemaining(`Ends in ${formatTime(diff)}`);
      } else {
        setElectionStatus('Ended');
        setTimeRemaining('Election has ended');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [election]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Connection Error</h2>
          <p className="text-gray-400">{error}</p>
          <button onClick={fetchResults} className="px-6 py-2 bg-primary rounded-full font-bold">Retry</button>
        </div>
      </div>
    );
  }

  const maxVotes = Math.max(...candidates.map(c => c.voteCount), 0);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-['Outfit'] py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <motion.div animate={{ scale: electionStatus === 'Live' ? [1, 1.05, 1] : 1 }} transition={{ repeat: Infinity, duration: 2 }} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-bold uppercase tracking-widest ${
              electionStatus === 'Live' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
              electionStatus === 'Upcoming' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
              'bg-red-500/20 border-red-500/30 text-red-400'
            }`}>
              {electionStatus === 'Live' && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
              {electionStatus}
            </motion.div>
            <div className="text-gray-400 font-mono bg-black/40 px-4 py-1 rounded-full border border-white/5 shadow-inner">
              ⏳ {timeRemaining}
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">{election.title}</h1>
          <p className="text-gray-400 text-xl font-light">Total Ballots Cast: <span className="text-white font-bold">{election.totalVotes.toLocaleString()}</span></p>
        </div>

        <div className="grid gap-8">
          {candidates.map((candidate, index) => {
            const percentage = election.totalVotes > 0 ? ((candidate.voteCount / election.totalVotes) * 100).toFixed(1) : "0.0";
            const isWinner = candidate.voteCount > 0 && candidate.voteCount === maxVotes;

            return (
              <motion.div key={candidate.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`relative bg-white/5 backdrop-blur-xl border ${isWinner ? 'border-primary/50' : 'border-white/10'} p-8 rounded-[2.5rem] overflow-hidden group hover:bg-white/[0.08] transition-all`}>
                {isWinner && <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-3xl font-bold text-xs uppercase tracking-tighter">Leading</div>}
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="flex items-center gap-6 md:w-1/3">
                    <div className="relative">
                      <img src={candidate.imageUrl} alt={candidate.name} className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 p-2 shadow-2xl" />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-dark border-4 border-[#1e293b] rounded-full flex items-center justify-center font-bold text-sm">#{index + 1}</div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{candidate.name}</h3>
                      <p className="text-primary font-semibold">{candidate.voteCount} Votes</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Share</span>
                      <span className="text-3xl font-black text-white">{percentage}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }} style={{ backgroundColor: candidate.color }} className="h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
                    </div>
                    {electionStatus === 'Live' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isVoting}
                        onClick={(e) => {
                          e.stopPropagation();
                          castVote(candidate.id);
                        }}
                        className={`mt-4 px-6 py-3 rounded-2xl text-xs font-bold uppercase transition-all w-full md:w-auto ${
                          isVoting 
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        {isVoting ? 'Casting...' : 'Cast Vote 🗳️'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage;
