import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { activities, newsArticles, stats } from '../data';

const eventDate = new Date('2026-12-16T09:00:00+06:00');

const getTimeRemaining = () => {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
};

const Home = () => {
  const [countdown, setCountdown] = useState(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const missionPillars = useMemo(
    () => [
      {
        title: 'শিক্ষা (Education)',
        description: 'Promote quality learning, critical thinking, and a culture of merit-based student leadership.',
      },
      {
        title: 'শৃঙ্খলা (Discipline)',
        description: 'Build responsible organizational behavior, accountability, and transparent public engagement.',
      },
      {
        title: 'প্রযুক্তি (Technology)',
        description: 'Enable digitally skilled youth through innovation, modern tools, and practical civic solutions.',
      },
      {
        title: 'সমৃদ্ধি (Prosperity)',
        description: 'Prepare students for national development through service, leadership, and community action.',
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[90vh] flex items-center bg-primary overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-dark/20 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gold rounded-full blur-[120px] pointer-events-none"
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-bold tracking-widest uppercase mb-6"
            >
              Nationalist Democratic Student Movement - NDSM
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6"
            >
              শিক্ষা শৃঙ্খলা প্রযুক্তি সমৃদ্ধি
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-200 font-body mb-10 leading-relaxed"
            >
              Build a democratic and disciplined student future through leadership, organization,
              and service. Join campus-to-national networks shaping responsible civic action.
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
              <Link to="/leadership">
                <Button variant="primary" size="lg">Meet Leadership</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Learn Our Vision
                </Button>
              </Link>
            </motion.div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-white backdrop-blur">
                  <div className="text-xs text-white/70">{item.label}</div>
                  <div className="mt-1 text-xl font-bold">{item.value.toLocaleString()}{item.suffix}</div>
                </div>
              ))}
            </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-gold">Next National Program</p>
                <h2 className="mt-3 text-2xl font-display font-bold">National Student Convention</h2>
                <p className="mt-2 text-sm text-gray-200">Countdown to 16 December 2026</p>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hours', value: countdown.hours },
                    { label: 'Min', value: countdown.minutes },
                    { label: 'Sec', value: countdown.seconds },
                  ].map((slot) => (
                    <div key={slot.label} className="rounded-lg bg-primary-dark/50 px-2 py-3 text-center">
                      <div className="text-xl font-bold">{String(slot.value).padStart(2, '0')}</div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-300">{slot.label}</div>
                    </div>
                  ))}
                </div>
                <Link to="/activities" className="inline-block mt-5">
                  <Button variant="accent" size="md">View Programs</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-primary">Movement Pillars</h2>
            <p className="mt-3 text-gray-600">A practical framework that guides chapter culture, member growth, and public responsibility.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {missionPillars.map((pillar) => (
              <motion.article
                key={pillar.title}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-primary-dark">{pillar.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{pillar.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-4xl font-display font-bold text-primary">Featured Activities</h2>
              <p className="mt-3 text-gray-600">Recent campaigns and learning programs active across our units.</p>
            </div>
            <Link to="/activities">
              <Button variant="outline" size="md">All Activities</Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.slice(0, 2).map((item) => (
              <article key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-3 text-xl font-semibold text-primary-dark">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
                <div className="mt-4 text-sm text-gray-500">{item.date} • {item.frequency}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-4xl font-display font-bold text-primary">Latest Updates</h2>
              <p className="mt-3 text-gray-600">Top announcements and highlights from national and campus chapters.</p>
            </div>
            <Link to="/news">
              <Button variant="outline" size="md">All News</Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsArticles.slice(0, 2).map((item) => (
              <article key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.tag}</span>
                <h3 className="mt-4 text-xl font-semibold text-primary-dark">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.excerpt}</p>
                <div className="mt-4 text-sm text-gray-500">{item.date} • {item.readTime}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="rounded-2xl border border-white/20 bg-primary-dark/30 p-8 md:p-10 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Become Part of the Movement</h2>
            <p className="mt-3 max-w-2xl mx-auto text-gray-200">
              Join students working for democratic values, ethical leadership, and meaningful change in campuses and communities.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button variant="gold" size="lg">Register as Member</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Contact Organization
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
