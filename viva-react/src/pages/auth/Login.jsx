import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { NDM_LOGO_URL, NDSM_NAME } from '../../constants/branding';

const Login = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { login, user } = useAuth();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    // If already logged in, redirect
    const from = location.state?.from?.pathname;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { user: userData } = await login({ email, password });
            const dest = from ?? (userData?.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/member');
            navigate(dest, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message ?? err.response?.data?.error ?? 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-6 sm:py-10 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md md:grid-cols-[1.1fr_1fr]"
            >
                <div className="relative hidden md:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-primary-dark/80 to-primary/60 border-r border-white/10">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 border border-white/20">
                            <img src={NDM_LOGO_URL} alt="NDSM logo" className="h-10 w-auto rounded-md border border-white/20" loading="lazy" />
                            <span className="text-lg font-display font-bold text-white">{NDSM_NAME}</span>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-white leading-tight">
                            Leadership. Unity. Democratic Values.
                        </h1>
                        <p className="text-white/80 text-sm leading-relaxed max-w-md">
                            Sign in to manage chapters, members, and activities with the official NDSM platform.
                        </p>
                    </div>
                </div>

                <div className="relative p-4 sm:p-8 lg:p-10 md:[perspective:1200px]">
                    <div className="hidden sm:block absolute inset-8 rounded-3xl bg-accent/20 blur-2xl" />
                    <div className="hidden sm:block absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border border-white/20 bg-primary-dark/20" />
                    <div className="hidden sm:block absolute inset-0 translate-x-4 translate-y-4 rounded-3xl border border-white/10 bg-accent/10" />

                    <div className="relative rounded-2xl sm:rounded-3xl border border-white/30 bg-white/95 p-5 sm:p-7 shadow-2xl transform-gpu md:[transform:rotateY(-3deg)_rotateX(2deg)]">
                        <div className="md:hidden mb-5">
                            <Link to="/" className="inline-flex max-w-full items-center gap-2.5 px-3 py-2 rounded-2xl bg-primary/10 border border-primary/20">
                                <img src={NDM_LOGO_URL} alt="NDSM logo" className="h-10 w-auto rounded-md border border-black/10" loading="lazy" />
                                <span className="text-sm sm:text-base leading-tight font-display font-bold text-primary-dark">{NDSM_NAME}</span>
                            </Link>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-dark">
                            Sign In
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Access your NDSM account
                        </p>

                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    className="block w-full rounded-xl border border-primary/25 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-primary/25 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {error && <p className="text-accent text-sm text-center">{error}</p>}

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                isLoading={loading}
                            >
                                {loading ? 'Authenticating...' : 'Sign in'}
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
