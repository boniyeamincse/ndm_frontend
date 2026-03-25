import React from 'react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="container pt-20"
    >
      <h1 className="text-4xl font-bold text-primary">Home Page</h1>
      <p className="mt-4 text-gray-600">Welcome to the Home page of NDM Student Movement.</p>
    </motion.div>
  );
};

export default Home;
