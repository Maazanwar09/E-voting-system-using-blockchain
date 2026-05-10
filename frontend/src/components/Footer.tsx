import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-8 text-center mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4">
        <p className="text-gray-400 mb-2">&copy; {new Date().getFullYear()} SecureVote Blockchain System.</p>
        <p className="text-lg font-semibold text-secondary">
          Developed by Maaz Anwar
        </p>
      </div>
    </footer>
  );
};

export default Footer;
