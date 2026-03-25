import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const Campuses = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 min-h-[70vh]"
    >
      <div className="container mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Campus Network</h1>
          <p className="text-gray-600 max-w-3xl">
            Explore Student Movement - NDM campus presence, chapter activities, and coordination points
            across universities and colleges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { name: 'Dhaka University Chapter', region: 'Dhaka', status: 'Active' },
            { name: 'Chittagong University Chapter', region: 'Chattogram', status: 'Active' },
            { name: 'Rajshahi University Chapter', region: 'Rajshahi', status: 'Expanding' },
            { name: 'Khulna University Chapter', region: 'Khulna', status: 'Active' },
            { name: 'Jahangirnagar University Chapter', region: 'Savar', status: 'Active' },
            { name: 'Sylhet Campus Cluster', region: 'Sylhet', status: 'Developing' },
          ].map((campus) => (
            <article key={campus.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-primary-dark">{campus.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Region: {campus.region}</p>
              <span className="inline-flex mt-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {campus.status}
              </span>
            </article>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-display font-bold text-primary">Want to start a campus chapter?</h3>
            <p className="text-sm text-gray-600 mt-1">Submit your interest and the organizing team will contact you.</p>
          </div>
          <Button type="button" variant="primary">Request Campus Activation</Button>
        </div>
      </div>
    </motion.section>
  );
};

export default Campuses;
