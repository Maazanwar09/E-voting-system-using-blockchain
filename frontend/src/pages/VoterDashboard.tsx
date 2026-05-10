import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const VoterDashboard = () => {
  const [activeElections, setActiveElections] = useState([
    { id: 1, title: 'Presidential Election 2026', description: 'Vote for the next President of the Republic.', endTime: '2026-11-03' },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Voter Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here are the elections you can participate in.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
            JD
          </div>
          <div>
            <h2 className="font-bold text-lg">John Doe</h2>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Verified Voter
            </p>
          </div>
          <div className="ml-auto">
            <button className="text-sm font-medium text-primary hover:underline">Connect Wallet</button>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Active Elections</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeElections.map(election => (
          <div key={election.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-2">{election.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{election.description}</p>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-semibold text-secondary bg-green-50 px-2 py-1 rounded-md">Closes: {election.endTime}</span>
            </div>
            <Link to={`/election/${election.id}`} className="block w-full text-center py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors">
              View & Vote
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoterDashboard;
