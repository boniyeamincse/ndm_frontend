import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const Contact = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50"
    >
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-gray-600 mb-8">Reach the central communications team for partnerships, chapter support, and movement information.</p>
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-primary-dark font-semibold">info@ndmstudent.org</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-primary-dark font-semibold">+880 1700-000000</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Head Office</p>
              <p className="text-primary-dark font-semibold">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>

        <form className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-2xl font-display font-bold text-primary">Send Message</h2>
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Your Name" />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Email Address" type="email" />
          <input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Subject" />
          <textarea className="w-full border border-gray-200 rounded-lg px-4 py-3 min-h-32" placeholder="Your Message" />
          <Button type="button" variant="primary">Submit Inquiry</Button>
        </form>
      </div>
    </motion.section>
  );
};

export default Contact;
