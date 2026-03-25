import React from 'react';
import { motion } from 'framer-motion';
import { galleryImages } from '../data';

const Gallery = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white"
    >
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Gallery</h1>
        <p className="text-gray-600 max-w-2xl mb-10">Snapshots from events, campaigns, and organizational milestones.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <article key={image.id} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="h-48 bg-gradient-to-br from-primary to-primary-dark" />
              <div className="p-4 bg-gray-50">
                <h2 className="font-semibold text-primary-dark">{image.caption}</h2>
                <p className="text-sm text-gray-500">{image.category}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Gallery;
