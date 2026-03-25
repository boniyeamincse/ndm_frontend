import React from 'react';
import { motion } from 'framer-motion';

const Gallery = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="container pt-20"
    >
      <h1 className="text-4xl font-bold text-primary">Gallery Page</h1>
      <p className="mt-4 text-gray-600">Welcome to the Gallery page of NDM Student Movement.</p>
    </motion.div>
  );
};

export default Gallery;
