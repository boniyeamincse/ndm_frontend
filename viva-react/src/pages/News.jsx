import React from 'react';
import { motion } from 'framer-motion';
import { newsArticles } from '../data';

const News = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 min-h-[70vh]"
    >
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Latest News</h1>
        <p className="text-gray-600 max-w-2xl mb-10">
          Updates, announcements, and movement highlights from NDM Student chapters across Bangladesh.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsArticles.map((item) => (
            <article key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-44 bg-gradient-to-r from-primary to-primary-dark" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{item.tag}</span>
                  <span className="text-gray-500">{item.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold text-primary-dark mb-3">{item.title}</h2>
                <p className="text-gray-600 mb-4">{item.excerpt}</p>
                <p className="text-sm text-gray-500">{item.date} · {item.author}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default News;
