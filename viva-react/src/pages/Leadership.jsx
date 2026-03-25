import React from 'react';
import { motion } from 'framer-motion';
import { leaders } from '../data';

const Leadership = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50"
    >
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Leadership</h1>
        <p className="text-gray-600 max-w-2xl mb-10">Meet the leaders guiding organizational strategy, student advocacy, and chapter growth.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {leaders.map((leader) => (
            <article key={leader.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-display text-xl flex items-center justify-center mb-4">
                {leader.name.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold text-primary-dark">{leader.name}</h2>
              <p className="text-accent font-medium mb-3">{leader.role}</p>
              <p className="text-gray-600">{leader.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Leadership;
