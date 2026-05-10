import React from 'react';
import { motion } from 'framer-motion';

const ResultsPage = () => {
  // Mock Data for the stunning visual demo
  const electionData = {
    title: "Student Union Presidency 2024",
    totalVotes: 1240,
    status: "Live",
    candidates: [
      { id: 1, name: "Alice Johnson", votes: 540, color: "#3b82f6", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
      { id: 2, name: "Bob Smith", votes: 420, color: "#10b981", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
      { id: 3, name: "Charlie Davis", votes: 280, color: "#f59e0b", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie" },
    ]
  };

  const maxVotes = Math.max(...electionData.candidates.map(c => c.votes));

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-['Outfit'] py-12 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-12 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center gap-2 px-4 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-xs font-bold uppercase tracking-widest"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live Counting
          </motion.div>
          <h1 className="text-5xl font-bold tracking-tight">{electionData.title}</h1>
          <p className="text-gray-400 text-xl font-light">Total Ballots Cast: <span className="text-white font-bold">{electionData.totalVotes.toLocaleString()}</span></p>
        </div>

        {/* Results Grid */}
        <div className="grid gap-8">
          {electionData.candidates.map((candidate, index) => {
            const percentage = ((candidate.votes / electionData.totalVotes) * 100).toFixed(1);
            const isWinner = candidate.votes === maxVotes;

            return (
              <motion.div 
                key={candidate.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/5 backdrop-blur-xl border ${isWinner ? 'border-primary/50' : 'border-white/10'} p-8 rounded-[2.5rem] overflow-hidden group hover:bg-white/[0.08] transition-all`}
              >
                {isWinner && (
                  <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-3xl font-bold text-xs uppercase tracking-tighter">
                    Leading Candidate
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  {/* Candidate Info */}
                  <div className="flex items-center gap-6 md:w-1/3">
                    <div className="relative">
                      <img src={candidate.image} alt={candidate.name} className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 p-2 shadow-2xl" />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-dark border-4 border-[#1e293b] rounded-full flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{candidate.name}</h3>
                      <p className="text-primary font-semibold">{candidate.votes} Votes</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Election Share</span>
                      <span className="text-3xl font-black text-white">{percentage}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                        style={{ backgroundColor: candidate.color }}
                        className="h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center py-8 border-t border-white/5">
          <p className="text-gray-500 text-sm">
            Blockchain Verified Results • Last updated {new Date().toLocaleTimeString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage;
