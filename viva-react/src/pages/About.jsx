import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const pillars = [
    {
      title: 'Democratic Values',
      description: 'We promote constructive dialogue, accountability, and student participation in decision-making at all levels.',
    },
    {
      title: 'Youth Leadership',
      description: 'We build future-ready leaders through training, organizing experience, and real community responsibility.',
    },
    {
      title: 'National Service',
      description: 'We connect student energy with social impact through awareness drives, relief work, and local development.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white"
    >
      <div className="bg-primary text-white">
        <div className="container mx-auto px-6 py-20">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">About NDM Student Movement</h1>
          <p className="text-white/90 max-w-3xl text-lg">
            NDM Student Movement is a nationwide youth platform focused on ethical leadership, civic engagement, and student empowerment.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-display font-bold text-primary mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            To organize students under a disciplined, inclusive, and service-oriented movement that strengthens democratic culture and nation-building.
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-display font-bold text-primary mb-4">Our Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            A future where every student can contribute meaningfully to society through education, leadership, and a strong sense of national responsibility.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20">
        <h3 className="text-3xl font-display font-bold text-primary mb-8">Core Pillars</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm bg-white">
              <h4 className="text-xl font-semibold text-primary-dark mb-3">{pillar.title}</h4>
              <p className="text-gray-600">{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default About;
