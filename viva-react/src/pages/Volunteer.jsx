import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const Volunteer = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 min-h-[70vh]"
    >
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Volunteer With Us</h1>
          <p className="text-gray-600 mb-8">
            Join Student Movement - NDM as a volunteer and support local chapters, community campaigns,
            youth leadership programs, and civic initiatives.
          </p>

          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Who Can Apply</p>
              <p className="text-primary-dark font-semibold">Students, youth organizers, and community contributors</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Commitment</p>
              <p className="text-primary-dark font-semibold">Flexible participation based on local chapter activities</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Support Areas</p>
              <p className="text-primary-dark font-semibold">Events, outreach, media, logistics, and training coordination</p>
            </div>
          </div>
        </div>

        <form className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Volunteer Form</h2>
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Full Name" />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Email Address" type="email" />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Phone Number" />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="District / Campus" />
          <textarea className="w-full border border-gray-200 rounded-lg px-4 py-3 min-h-32" placeholder="How would you like to contribute?" />
          <Button type="button" variant="primary">Submit Volunteer Interest</Button>
        </form>
      </div>
    </motion.section>
  );
};

export default Volunteer;
