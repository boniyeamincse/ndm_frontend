import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Task 31: Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-primary overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-dark/20 to-transparent pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gold rounded-full blur-[120px] pointer-events-none"
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-bold tracking-widest uppercase mb-6"
            >
              Bangladesh's Premier Student Movement
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6"
            >
              Shaping the Future <br />
              <span className="text-gold italic">Together with Integrity</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-200 font-body mb-10 leading-relaxed"
            >
              Join the largest network of visionary students dedicated to democratic values, 
              social justice, and the holistic development of our nation. Your voice is the catalyst for change.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/join">
                <Button variant="gold" size="lg">Start Your Journey</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Learn Our Vision
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Placeholder for Next Sections */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-bold text-primary mb-12">Empowering Every Student</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Democracy", desc: "Upholding the rights and voices of every student across the country." },
              { title: "Integrity", desc: "Building a transparent and ethical movement for sustainable impact." },
              { title: "Excellence", desc: "Striving for the highest standards in education and social contribution." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl font-bold mb-6 mx-auto">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
