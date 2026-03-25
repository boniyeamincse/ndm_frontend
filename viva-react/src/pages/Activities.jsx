import React from 'react';
import { motion } from 'framer-motion';
import { activities } from '../data';

const Activities = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white"
    >
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Activities</h1>
        <p className="text-gray-600 max-w-2xl mb-10">Programs and campaigns that connect students with practical leadership and social service.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((item) => (
            <article key={item.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm bg-gray-50">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h2 className="text-xl font-semibold text-primary-dark mb-2">{item.title}</h2>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex gap-3 text-sm text-gray-500">
                <span>{item.date}</span>
                <span>•</span>
                <span>{item.frequency}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Activities;
