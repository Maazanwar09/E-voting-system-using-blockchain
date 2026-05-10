import React, { useState } from 'react';

const AdminDashboard = () => {
  const [elections, setElections] = useState([
    { id: 1, title: 'Presidential Election 2026', status: 'Active', votes: 12450 },
    { id: 2, title: 'Local Council', status: 'Upcoming', votes: 0 },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
        <button className="px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-blue-800 transition-colors">
          + Create Election
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 mb-1">Total Elections</h3>
          <p className="text-3xl font-bold text-dark">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 mb-1">Total Votes Cast</h3>
          <p className="text-3xl font-bold text-dark">45,231</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 mb-1">Registered Voters</h3>
          <p className="text-3xl font-bold text-dark">10,500</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold">Recent Elections</h2>
        </div>
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="pb-3">Title</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Votes</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.map(election => (
                <tr key={election.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium">{election.title}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${election.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {election.status}
                    </span>
                  </td>
                  <td className="py-4">{election.votes}</td>
                  <td className="py-4">
                    <button className="text-primary hover:underline mr-3">Manage</button>
                    <button className="text-red-500 hover:underline">End</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
