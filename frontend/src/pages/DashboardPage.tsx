import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from '../utils/constants';

const DashboardPage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  
  // Election Form State
  const [electionTitle, setElectionTitle] = useState('');
  const [electionDesc, setElectionDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [elections, setElections] = useState<any[]>([]);
  const [isLoadingElections, setIsLoadingElections] = useState(false);

  // Candidate Form State
  const [candidateName, setCandidateName] = useState('');
  const [candidateDetails, setCandidateDetails] = useState('');
  const [candidateElectionId, setCandidateElectionId] = useState('');
  const [candidateImage, setCandidateImage] = useState('');
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchElections();
    }
  }, [user, navigate]);

  const fetchElections = async () => {
    try {
      setIsLoadingElections(true);
      // Connect to Sepolia via Alchemy
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      
      // Check if the contract is actually deployed at this address
      const code = await provider.getCode(VOTING_CONTRACT_ADDRESS);
      if (code === "0x") {
        // Contract not deployed to Sepolia yet — show empty list gracefully
        console.warn("Contract not deployed to Sepolia yet. Deploy first, then refresh.");
        setElections([]);
        return;
      }

      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);
      const count = await contract.electionCount();
      const electionList = [];
      
      const start = Math.max(1, Number(count) - 10);
      for (let i = Number(count); i >= start; i--) {
        try {
          const election = await contract.elections(i);
          if (election.title) {
            electionList.push({
              id: i,
              title: election.title,
              description: election.description,
              isActive: election.isActive,
              candidateCount: Number(election.candidateCount)
            });
          }
        } catch (e) {
          console.warn(`Failed to fetch election ${i}:`, e);
        }
      }
      setElections(electionList);
    } catch (error) {
      console.error("Failed to fetch elections:", error);
      setElections([]);
    } finally {
      setIsLoadingElections(false);
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const promoteToAdmin = async () => {
    try {
      setIsPromoting(true);
      const response = await fetch('http://127.0.0.1:5000/api/auth/promote', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ email: user.email })
      });
      const data = await response.json();
      if (response.ok) {
        login(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPromoting(false);
    }
  };

  const createElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) {
      window.alert("MetaMask not detected! Please install MetaMask.");
      return;
    }
    if (!user.walletAddress) {
      window.alert("Please link your MetaMask wallet first!");
      return;
    }

    try {
      setIsCreating(true);

      // Force MetaMask to switch to the local Hardhat network before transacting
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 0x7A69 = 31337 in hex
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + (3600 * 24 * 7);

      const tx = await contract.createElection(electionTitle, electionDesc, startTime, endTime, {
        gasLimit: 3000000
      });
      await tx.wait();

      await fetch('http://127.0.0.1:5000/api/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: electionTitle,
          description: electionDesc,
          startTime: new Date(startTime * 1000),
          endTime: new Date(endTime * 1000)
        })
      });

      setElectionTitle('');
      setElectionDesc('');
    } catch (error: any) {
      console.error(error);
      window.alert("Blockchain Error: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setIsCreating(false);
    }
  };

  const addCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) {
      window.alert("MetaMask not detected! Please install MetaMask.");
      return;
    }
    if (!user.walletAddress) {
      window.alert("Please link your MetaMask wallet first!");
      return;
    }
    if (!candidateElectionId) {
      window.alert("Please select an election.");
      return;
    }

    try {
      setIsAddingCandidate(true);

      // Force MetaMask to switch to the local Hardhat network before transacting
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 0x7A69 = 31337 in hex
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

      const tx = await contract.addCandidate(
        Number(candidateElectionId), 
        candidateName, 
        candidateDetails, 
        candidateImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidateName}`
      );
      await tx.wait();

      setCandidateName('');
      setCandidateDetails('');
      setCandidateElectionId('');
      setCandidateImage('');
      window.alert("Candidate added successfully!");
    } catch (error: any) {
      console.error(error);
      window.alert("Blockchain Error: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return;

    try {
      setIsConnecting(true);

      // Ensure we're on the local Hardhat network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337
      });

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      const response = await fetch('http://127.0.0.1:5000/api/auth/wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      const updatedUser = await response.json();
      if (response.ok) {
        login(updatedUser);
      }
    } catch (error: any) {
      console.error(error);
      window.alert("Wallet Error: " + (error.message || "Failed to connect wallet"));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-['Outfit'] py-12 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-12 relative z-10"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Voter Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Welcome back, <span className="text-primary font-semibold">{user.name}</span></p>
          </div>
          
          <div className="flex gap-4">
            {user.role !== 'admin' && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={promoteToAdmin}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-semibold hover:bg-white/20 transition-all text-sm"
              >
                {isPromoting ? 'Upgrading...' : 'Enable Admin Access'}
              </motion.button>
            )}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-semibold hover:bg-red-500/20 transition-all text-sm"
            >
              Sign Out
            </motion.button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <div className={`w-3 h-3 rounded-full ${user.role === 'admin' ? 'bg-yellow-400' : 'bg-emerald-400'}`}></div>
              </div>
              
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">👤</span>
                Profile Identity
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email Address</label>
                  <p className="text-lg font-medium text-gray-200">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">System Role</label>
                  <p className="text-lg font-medium text-primary uppercase tracking-tight">{user.role}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Web3 Wallet</label>
                  <div className="mt-2 font-mono text-[10px] break-all bg-black/40 p-4 rounded-2xl border border-white/5 text-gray-400">
                    {user.walletAddress || 'No Wallet Linked'}
                  </div>
                </div>
                
                {!user.walletAddress && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-primary/30"
                  >
                    {isConnecting ? 'Bridging...' : 'Link MetaMask Wallet'}
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Votes Cast</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Elections</p>
                <p className="text-3xl font-bold mt-1 text-secondary">12</p>
              </div>
            </div>
          </div>

          {/* Admin Management Section */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {user.role === 'admin' ? (
                <motion.div 
                  key="admin-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl h-full"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-3xl font-bold text-white tracking-tight">Create New Election</h3>
                      <p className="text-gray-400 mt-2">Initialize a secure, immutable voting event on the blockchain.</p>
                    </div>
                    <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-tighter">Admin Console</span>
                  </div>

                  <form onSubmit={createElection} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 ml-1">Title of Election</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. National Student Union 2024"
                        value={electionTitle}
                        onChange={(e) => setElectionTitle(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-white transition-all text-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 ml-1">Event Description</label>
                      <textarea
                        required
                        placeholder="Explain the purpose and rules of this voting process..."
                        value={electionDesc}
                        onChange={(e) => setElectionDesc(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-white transition-all h-32 text-lg"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isCreating || !user.walletAddress}
                      className={`w-full py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all ${
                        isCreating || !user.walletAddress 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                      }`}
                    >
                      {isCreating ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Blockchain...
                        </span>
                      ) : (
                        !user.walletAddress ? 'Connect Wallet to Launch' : 'Deploy Election Event'
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-12 pt-10 border-t border-white/10">
                    <h3 className="text-2xl font-bold text-white tracking-tight mb-6">Manage Candidates</h3>
                    <form onSubmit={addCandidate} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <label className="text-sm font-semibold text-gray-300 ml-1">Select Election</label>
                          <select
                            required
                            value={candidateElectionId}
                            onChange={(e) => setCandidateElectionId(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-white transition-all text-lg appearance-none"
                          >
                            <option value="" disabled className="bg-dark text-gray-500">Choose an election...</option>
                            {elections.map(e => (
                              <option key={e.id} value={e.id} className="bg-dark">{e.title}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <label className="text-sm font-semibold text-gray-300 ml-1">Candidate Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Jane Doe"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-white transition-all text-lg"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-sm font-semibold text-gray-300 ml-1">Candidate Details / Bio</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Senior majoring in Computer Science"
                            value={candidateDetails}
                            onChange={(e) => setCandidateDetails(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-white transition-all text-lg"
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isAddingCandidate || !user.walletAddress}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                          isAddingCandidate || !user.walletAddress 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20'
                        }`}
                      >
                        {isAddingCandidate ? 'Adding to Blockchain...' : 'Register Candidate'}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="voter-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center h-full space-y-6"
                >
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-5xl mb-4">🗳️</div>
                  <h3 className="text-3xl font-bold">Ready to Vote?</h3>
                  <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                    You currently have access as a voter. Browse active elections or connect your wallet to start making your voice heard.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors">
                      Browse Elections
                    </button>
                    <button className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-colors">
                      View Results
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Elections Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold">Live Elections</h3>
            <button 
              onClick={fetchElections}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              🔄
            </button>
          </div>

          {isLoadingElections ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : elections.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => (
                <motion.div
                  key={election.id}
                  whileHover={{ y: -5 }}
                  className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-4 hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/results/${election.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <span className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">🗳️</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${election.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {election.isActive ? 'Active' : 'Ended'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{election.title}</h4>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">{election.description}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    <span>{election.candidateCount} Candidates</span>
                    <span className="text-primary font-bold">View Details →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/10">
              <p className="text-gray-500">No elections found on the blockchain.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
