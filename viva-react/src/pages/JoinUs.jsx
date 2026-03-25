import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { districts } from '../data';

const JoinUs = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white"
    >
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Join the Movement</h1>
          <p className="text-gray-600 mb-8">Become part of a nationwide student network working for leadership, unity, and national development.</p>
          <ul className="space-y-3 text-gray-700">
            <li>• Leadership training and chapter development</li>
            <li>• Campus and district activity participation</li>
            <li>• Volunteer opportunities and community initiatives</li>
          </ul>
        </div>

        <form className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Full Name" />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Email Address" type="email" />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Phone Number" />
          <select className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white" defaultValue="">
            <option value="" disabled>Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <textarea className="w-full border border-gray-200 rounded-lg px-4 py-3 min-h-28" placeholder="Why do you want to join?" />
          <Button type="button" variant="gold">Submit Application</Button>
        </form>
      </div>
    </motion.section>
  );
};

export default JoinUs;
