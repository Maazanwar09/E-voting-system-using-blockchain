import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-light">
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold text-dark tracking-tight mb-6"
          >
            The Future of <span className="text-primary">Democracy</span> is <span className="text-secondary">Here</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
          >
            A highly secure, immutable, and transparent blockchain-based e-voting platform. Every vote is a transaction on the Ethereum network.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/login" className="px-8 py-4 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 inline-block">
              Get Started
            </Link>
          </motion.div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose SecureVote?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Immutable Records", desc: "Powered by smart contracts, votes cannot be altered or deleted." },
              { title: "Anonymity", desc: "Cryptographic techniques ensure voter privacy while maintaining transparency." },
              { title: "Real-time Results", desc: "Watch the election results unfold live directly from the blockchain." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 bg-light rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-6 h-6 bg-primary rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
