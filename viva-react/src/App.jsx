import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-8"
  >
    <h1 className="text-4xl font-bold text-primary">Welcome to Viva React</h1>
    <p className="mt-4 text-accent">An animated project with custom colors.</p>
    <div className="mt-8 flex gap-4">
      <div className="w-20 h-20 bg-primary rounded shadow-lg flex items-center justify-center text-white">Primary</div>
      <div className="w-20 h-20 bg-accent rounded shadow-lg flex items-center justify-center text-white text-xs">Accent</div>
      <div className="w-20 h-20 bg-gold rounded shadow-lg flex items-center justify-center text-gray-900 font-bold">Gold</div>
    </div>
    <Link to="/about" className="mt-8 inline-block text-blue-600 hover:underline">About Page</Link>
  </motion.div>
);

const About = () => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="p-8"
  >
    <h1 className="text-3xl font-bold text-primary-dark">About Page</h1>
    <p className="mt-4 text-primary-light">This page demonstrates routing and custom theme colors.</p>
    <Link to="/" className="mt-8 inline-block text-blue-600 hover:underline">Go Home</Link>
  </motion.div>
);

function App() {
  return (
    <div className="min-h-screen">
      <nav className="bg-primary p-4 text-white shadow-md">
        <ul className="flex gap-4">
          <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
          <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
