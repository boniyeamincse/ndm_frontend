import { useState, useEffect, useRef } from "react";

/* ============================================================
   NDM STUDENT MOVEMENT — Full React + Tailwind Website
   Color Theme: Deep Green (#006A4E), White, Red (#DC143C)
   Font: Playfair Display (display) + DM Sans (body)
============================================================ */

// ── Inject Google Fonts + Global Styles ──────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --green: #006A4E;
      --green-dark: #004d38;
      --green-light: #00835f;
      --red: #DC143C;
      --red-dark: #b01030;
      --gold: #F0C040;
      --white: #FFFFFF;
      --off-white: #F8FAF9;
      --gray-100: #f1f5f4;
      --gray-200: #e2e9e6;
      --gray-500: #6b7c75;
      --gray-800: #1a2e28;
      --text: #0f1f1a;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--white);
      color: var(--text);
      line-height: 1.7;
    }

    .font-display { font-family: 'Playfair Display', serif; }

    /* Loading screen */
    .loader-screen {
      position: fixed; inset: 0; z-index: 9999;
      background: var(--green-dark);
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    }
    .loader-screen.hidden { opacity: 0; visibility: hidden; }
    .loader-ring {
      width: 64px; height: 64px;
      border: 4px solid rgba(255,255,255,0.2);
      border-top-color: var(--red);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Fade-in animation */
    .fade-up {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .fade-up.visible { opacity: 1; transform: translateY(0); }

    /* Counter */
    .stat-num { font-family: 'Playfair Display', serif; }

    /* Glassmorphism nav */
    .nav-glass {
      backdrop-filter: blur(16px);
      background: rgba(0, 106, 78, 0.95);
    }

    /* Hero gradient */
    .hero-bg {
      background:
        linear-gradient(135deg, rgba(0,77,56,0.96) 0%, rgba(0,106,78,0.88) 60%, rgba(220,20,60,0.15) 100%),
        url('https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&q=80') center/cover no-repeat;
    }

    /* Card hover lift */
    .card-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .card-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,106,78,0.15); }

    /* Ticker */
    .ticker-wrap { overflow: hidden; }
    .ticker-track {
      display: flex; gap: 3rem;
      animation: ticker 28s linear infinite;
      white-space: nowrap;
    }
    @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

    /* Timeline */
    .timeline-line::before {
      content: '';
      position: absolute; left: 20px; top: 0; bottom: 0;
      width: 2px; background: var(--gray-200);
    }

    /* Gallery lightbox */
    .lightbox { position: fixed; inset: 0; z-index: 8000; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; }

    /* Mobile menu */
    .mobile-menu { transition: max-height 0.4s ease, opacity 0.4s ease; overflow: hidden; }
    .mobile-menu.closed { max-height: 0; opacity: 0; }
    .mobile-menu.open { max-height: 600px; opacity: 1; }

    /* Smooth underline nav link */
    .nav-link {
      position: relative;
      color: rgba(255,255,255,0.85);
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.03em;
      transition: color 0.25s;
      text-decoration: none;
    }
    .nav-link::after {
      content: '';
      position: absolute; left: 0; bottom: -4px;
      width: 0; height: 2px;
      background: var(--red);
      transition: width 0.3s ease;
    }
    .nav-link:hover { color: #fff; }
    .nav-link:hover::after { width: 100%; }

    /* Form inputs */
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid var(--gray-200);
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      transition: border-color 0.25s, box-shadow 0.25s;
      outline: none;
      background: white;
    }
    .form-input:focus {
      border-color: var(--green);
      box-shadow: 0 0 0 3px rgba(0,106,78,0.12);
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--gray-100); }
    ::-webkit-scrollbar-thumb { background: var(--green); border-radius: 3px; }

    /* Dark mode */
    body.dark {
      background: #0a1a14;
      color: #e8f0ec;
    }
    body.dark .nav-glass { background: rgba(5, 30, 20, 0.97); }
    body.dark .bg-white, body.dark .bg-off-white { background: #0f2218 !important; }
    body.dark .form-input { background: #1a3328; color: #e8f0ec; border-color: #2a4a3a; }
    body.dark .card-dark { background: #0f2218; border-color: #1e3d2d; }
    body.dark .text-gray-700 { color: #a8c4b4 !important; }
    body.dark .text-gray-600 { color: #8aab9a !important; }
    body.dark .text-gray-500 { color: #6b8f7e !important; }
    body.dark .border-gray-200 { border-color: #1e3d2d !important; }
    body.dark .bg-gray-50 { background: #0d1e17 !important; }
    body.dark .bg-gray-100 { background: #0f2218 !important; }

    @media (max-width: 768px) {
      .hero-bg { background-position: 70% center; }
    }
  `}</style>
);

// ── Data ─────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Leadership", href: "#leadership" },
  { label: "Activities", href: "#activities" },
  { label: "News", href: "#news" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const STATS = [
  { value: 50000, label: "Active Members", suffix: "+" },
  { value: 64, label: "Districts Covered", suffix: "" },
  { value: 1200, label: "Programs Run", suffix: "+" },
  { value: 18, label: "Years of Service", suffix: "" },
];

const LEADERS = [
  { name: "Arafat Hossain", role: "President", img: "https://i.pravatar.cc/300?img=11" },
  { name: "Nusrat Jahan", role: "General Secretary", img: "https://i.pravatar.cc/300?img=47" },
  { name: "Mehedi Hasan", role: "Vice President", img: "https://i.pravatar.cc/300?img=15" },
  { name: "Sadia Islam", role: "Organizing Secretary", img: "https://i.pravatar.cc/300?img=49" },
  { name: "Raihan Kabir", role: "Publicity Secretary", img: "https://i.pravatar.cc/300?img=18" },
  { name: "Fahmida Akter", role: "Cultural Secretary", img: "https://i.pravatar.cc/300?img=44" },
];

const ACTIVITIES = [
  { icon: "🎓", title: "Leadership Training", desc: "Intensive workshops to build tomorrow's visionary leaders across Bangladesh.", date: "Monthly" },
  { icon: "📚", title: "Academic Support", desc: "Free tutoring, scholarship guidance, and study circles for underprivileged students.", date: "Ongoing" },
  { icon: "🌿", title: "Green Campus Drive", desc: "Planting 10,000 trees across university campuses by 2025.", date: "Annual" },
  { icon: "⚖️", title: "Rights Awareness", desc: "Legal aid clinics and awareness rallies defending student rights.", date: "Quarterly" },
  { icon: "💻", title: "Digital Skills Lab", desc: "Free coding bootcamps and digital literacy programs for rural youth.", date: "Bi-annual" },
  { icon: "🤝", title: "Community Service", desc: "Flood relief, health camps, and disaster response across vulnerable districts.", date: "As needed" },
];

const NEWS = [
  { tag: "Event", date: "March 20, 2026", title: "NDM National Convention 2026 Draws 15,000 Youth", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", excerpt: "The landmark annual convention brought together student leaders from all 64 districts to chart a bold vision for Bangladesh's future." },
  { tag: "Achievement", date: "March 10, 2026", title: "NDM Launches Free Digital Skills for 10,000 Students", img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80", excerpt: "A new partnership with leading tech companies will provide free coding and digital skills training to youth across rural Bangladesh." },
  { tag: "Campaign", date: "February 28, 2026", title: "Green Bangladesh: 5,000 Trees Planted in One Day", img: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80", excerpt: "NDM volunteers set a national record by planting over 5,000 saplings across 32 campuses in a single day of action." },
];

const GALLERY_IMGS = [
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80",
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
];

const TICKER_ITEMS = [
  "🔴 NDM National Convention 2026 — March 25, Dhaka",
  "🟢 New District Units opened in Sylhet & Khulna",
  "🔴 Scholarship applications open until April 15",
  "🟢 Free Digital Skills Lab — Register Now",
  "🔴 Green Campus Drive: 10,000 trees by 2025",
  "🟢 Rights Awareness Rally — Chittagong, April 2",
];

// ── Utility Hooks ─────────────────────────────────────────────
function useScrollAnimation() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useCounter(target, duration = 2000, isVisible) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, isVisible]);
  return count;
}

// ── Loader ────────────────────────────────────────────────────
function Loader({ hidden }) {
  return (
    <div className={`loader-screen ${hidden ? "hidden" : ""}`}>
      <div style={{ textAlign: "center" }}>
        <div className="loader-ring" style={{ margin: "0 auto 1rem" }} />
        <div style={{ color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", letterSpacing: "0.15em", opacity: 0.7 }}>
          LOADING NDM
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar({ darkMode, setDarkMode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="nav-glass"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.18)" : "none",
        transition: "box-shadow 0.3s",
      }}
      role="navigation" aria-label="Main navigation"
    >
      {/* Top bar */}
      <div style={{ background: "var(--red)", padding: "5px 0", fontSize: "0.78rem", color: "white", textAlign: "center", fontWeight: 500 }}>
        📣 NDM National Convention 2026 — Register Now &nbsp;|&nbsp; Empowering Youth Since 2007
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        {/* Logo */}
        <a href="#home" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--red), #ff4d6d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif", fontWeight: 900, color: "white", fontSize: "1.1rem",
            boxShadow: "0 2px 12px rgba(220,20,60,0.4)"
          }}>N</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, color: "white", fontSize: "1.15rem", lineHeight: 1 }}>NDM</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem", letterSpacing: "0.1em", lineHeight: 1.2 }}>STUDENT MOVEMENT</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: "1.8rem", alignItems: "center" }} className="desktop-nav">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
          <a href="#join"
            style={{ background: "var(--red)", color: "white", padding: "0.5rem 1.25rem", borderRadius: 6, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", transition: "background 0.25s", letterSpacing: "0.03em" }}
            onMouseEnter={e => e.target.style.background = "var(--red-dark)"}
            onMouseLeave={e => e.target.style.background = "var(--red)"}
          >Join Us</a>
          {/* Dark mode toggle */}
          <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode"
            style={{ background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", borderRadius: 6, padding: "0.4rem 0.6rem", color: "white", fontSize: "1rem", transition: "background 0.25s" }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.12)"}
          >{darkMode ? "☀️" : "🌙"}</button>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "1.5rem" }} className="hamburger">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : "closed"}`} style={{ background: "var(--green-dark)", padding: menuOpen ? "1rem 1.5rem" : "0 1.5rem" }}>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
            style={{ display: "block", padding: "0.75rem 0", color: "rgba(255,255,255,0.85)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", fontWeight: 500 }}
          >{l.label}</a>
        ))}
        <a href="#join" onClick={() => setMenuOpen(false)}
          style={{ display: "block", marginTop: "1rem", background: "var(--red)", color: "white", textAlign: "center", padding: "0.75rem", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}
        >Join Us Now</a>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

// ── News Ticker ───────────────────────────────────────────────
function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ background: "var(--green-dark)", color: "white", padding: "0.55rem 0", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ background: "var(--red)", padding: "0.3rem 1rem", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0, zIndex: 1 }}>
          BREAKING
        </div>
        <div className="ticker-wrap" style={{ flex: 1 }}>
          <div className="ticker-track">
            {doubled.map((item, i) => (
              <span key={i} style={{ fontSize: "0.82rem", opacity: 0.9, paddingRight: "3rem" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="home" className="hero-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", width: "100%" }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(220,20,60,0.2)", border: "1px solid rgba(220,20,60,0.4)", borderRadius: 100, padding: "0.35rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", display: "inline-block", animation: "ping 1.5s ease infinite" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em" }}>NATIONAL DEMOCRATIC MOVEMENT</span>
          </div>

          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            Empowering<br />
            <span style={{ color: "var(--gold)" }}>Future Leaders</span><br />
            of Bangladesh
          </h1>

          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: 560 }}>
            NDM Student Movement unites the youth of Bangladesh under a shared vision — democratic values, academic excellence, and a just society for all.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a href="#join"
              style={{ background: "var(--red)", color: "white", padding: "0.9rem 2rem", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: "1rem", transition: "transform 0.2s, background 0.2s", display: "inline-block" }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.background = "var(--red-dark)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.background = "var(--red)"; }}
            >🔥 Join the Movement</a>
            <a href="#about"
              style={{ background: "rgba(255,255,255,0.12)", color: "white", padding: "0.9rem 2rem", borderRadius: 8, fontWeight: 600, textDecoration: "none", fontSize: "1rem", border: "1px solid rgba(255,255,255,0.25)", transition: "background 0.2s", display: "inline-block" }}
              onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.22)"}
              onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.12)"}
            >Learn More →</a>
          </div>

          {/* Quick stats bar */}
          <div style={{ display: "flex", gap: "2rem", marginTop: "3.5rem", flexWrap: "wrap" }}>
            {[["50K+", "Members"], ["64", "Districts"], ["18", "Years"]].map(([val, lab]) => (
              <div key={lab} style={{ borderLeft: "3px solid var(--red)", paddingLeft: "0.75rem" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, color: "white", fontSize: "1.6rem", lineHeight: 1 }}>{val}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", letterSpacing: "0.08em" }}>{lab}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }
      `}</style>
    </section>
  );
}

// ── Stats Section ─────────────────────────────────────────────
function StatCard({ value, label, suffix }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const count = useCounter(value, 2200, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="fade-up" style={{ textAlign: "center", padding: "2rem 1rem" }}>
      <div className="stat-num" style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--green)", lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: "var(--gray-500)", fontWeight: 500, marginTop: "0.5rem", letterSpacing: "0.04em", fontSize: "0.95rem" }}>{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <section style={{ background: "var(--off-white)", borderTop: "4px solid var(--green)", borderBottom: "4px solid var(--green)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" style={{ padding: "6rem 0", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          {/* Image side */}
          <div className="fade-up" style={{ position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=700&q=80" alt="Students" style={{ width: "100%", borderRadius: 16, objectFit: "cover", height: 460 }} />
            <div style={{ position: "absolute", bottom: -24, right: -24, background: "var(--red)", color: "white", borderRadius: 12, padding: "1.5rem 2rem", boxShadow: "0 8px 32px rgba(220,20,60,0.35)" }}>
              <div className="font-display" style={{ fontSize: "2.2rem", fontWeight: 900 }}>2007</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>Founded</div>
            </div>
          </div>

          {/* Text side */}
          <div className="fade-up">
            <div style={{ color: "var(--red)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem", marginBottom: "0.75rem" }}>ABOUT NDM</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "var(--green-dark)", lineHeight: 1.15, marginBottom: "1.25rem" }}>
              A Movement Built on Truth, Unity & Progress
            </h2>
            <p style={{ color: "var(--gray-500)", lineHeight: 1.85, marginBottom: "1.25rem" }}>
              The National Democratic Movement Student Wing (NDM) was founded in 2007 with a singular purpose: to build an organized, educated, and conscientious student force that upholds the democratic values of Bangladesh.
            </p>
            <p style={{ color: "var(--gray-500)", lineHeight: 1.85, marginBottom: "2rem" }}>
              From our humble origins as a campus movement at Dhaka University, NDM today spans all 64 districts, representing over 50,000 active members who believe in fair governance, quality education, and a corruption-free Bangladesh.
            </p>

            {/* Vision / Mission */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { icon: "🎯", title: "Vision", text: "A democratic Bangladesh where every youth has equal opportunity to lead." },
                { icon: "🚀", title: "Mission", text: "Develop capable, ethical leaders through education, service, and advocacy." },
              ].map(({ icon, title, text }) => (
                <div key={title} style={{ background: "var(--off-white)", borderRadius: 10, padding: "1.25rem", borderLeft: "3px solid var(--green)" }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{icon}</div>
                  <div style={{ fontWeight: 700, color: "var(--green-dark)", marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ fontSize: "0.88rem", color: "var(--gray-500)", lineHeight: 1.6 }}>{text}</div>
                </div>
              ))}
            </div>

            <a href="#activities" style={{ background: "var(--green)", color: "white", padding: "0.85rem 2rem", borderRadius: 8, fontWeight: 700, textDecoration: "none", display: "inline-block", transition: "background 0.25s" }}
              onMouseEnter={e => e.target.style.background = "var(--green-dark)"}
              onMouseLeave={e => e.target.style.background = "var(--green)"}
            >Explore Our Work →</a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #about .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── Leadership ────────────────────────────────────────────────
function Leadership() {
  return (
    <section id="leadership" style={{ padding: "6rem 0", background: "var(--off-white)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ color: "var(--red)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem", marginBottom: "0.75rem" }}>OUR TEAM</div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "var(--green-dark)" }}>National Leadership</h2>
          <p style={{ color: "var(--gray-500)", maxWidth: 500, margin: "0.75rem auto 0", lineHeight: 1.8 }}>
            Dedicated youth leaders steering the movement with integrity and purpose.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.75rem" }}>
          {LEADERS.map((l) => (
            <div key={l.name} className="card-lift card-dark fade-up" style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid var(--gray-200)", textAlign: "center" }}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img src={l.img} alt={l.name} style={{ width: "100%", height: 220, objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,77,56,0.7) 0%, transparent 60%)", opacity: 0, transition: "opacity 0.3s" }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0}
                />
              </div>
              <div style={{ padding: "1.25rem" }}>
                <div style={{ fontWeight: 700, color: "var(--green-dark)", fontSize: "1rem" }}>{l.name}</div>
                <div style={{ color: "var(--red)", fontWeight: 600, fontSize: "0.82rem", letterSpacing: "0.06em", marginTop: "0.25rem" }}>{l.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Leadership message */}
        <div className="fade-up" style={{ marginTop: "4rem", background: "var(--green-dark)", borderRadius: 20, padding: "2.5rem", display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <img src="https://i.pravatar.cc/120?img=11" alt="President" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--gold)", flexShrink: 0 }} />
          <div>
            <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>MESSAGE FROM THE PRESIDENT</div>
            <blockquote className="font-display" style={{ color: "white", fontSize: "1.2rem", fontStyle: "italic", lineHeight: 1.7, marginBottom: "1rem" }}>
              "We are not just a student organization — we are a movement of conscience. Every member of NDM carries the hope of a democratic, prosperous Bangladesh."
            </blockquote>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem" }}>— Arafat Hossain, President, NDM Student Movement</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Activities ────────────────────────────────────────────────
function Activities() {
  return (
    <section id="activities" style={{ padding: "6rem 0", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ color: "var(--red)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem", marginBottom: "0.75rem" }}>WHAT WE DO</div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "var(--green-dark)" }}>Programs & Initiatives</h2>
          <p style={{ color: "var(--gray-500)", maxWidth: 520, margin: "0.75rem auto 0", lineHeight: 1.8 }}>
            From digital skills to environmental drives, NDM runs impactful programs that shape the next generation.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {ACTIVITIES.map((a, i) => (
            <div key={a.title} className="card-lift card-dark fade-up" style={{ background: "var(--off-white)", borderRadius: 14, padding: "2rem", border: "1px solid var(--gray-200)", borderTop: `4px solid ${i % 2 === 0 ? "var(--green)" : "var(--red)"}` }}>
              <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>{a.icon}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--green-dark)", fontSize: "1.05rem" }}>{a.title}</h3>
                <span style={{ background: "var(--green)", color: "white", padding: "0.2rem 0.65rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap", marginLeft: "0.5rem" }}>{a.date}</span>
              </div>
              <p style={{ color: "var(--gray-500)", fontSize: "0.92rem", lineHeight: 1.7 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── News ──────────────────────────────────────────────────────
function News() {
  return (
    <section id="news" style={{ padding: "6rem 0", background: "var(--off-white)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ color: "var(--red)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem", marginBottom: "0.5rem" }}>LATEST NEWS</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, color: "var(--green-dark)" }}>News & Updates</h2>
          </div>
          <a href="#" style={{ color: "var(--green)", fontWeight: 600, textDecoration: "none", border: "1.5px solid var(--green)", padding: "0.55rem 1.25rem", borderRadius: 8, fontSize: "0.9rem" }}>View All News →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
          {NEWS.map((n) => (
            <article key={n.title} className="card-lift card-dark fade-up" style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid var(--gray-200)" }}>
              <div style={{ overflow: "hidden", height: 200 }}>
                <img src={n.img} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.07)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                />
              </div>
              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center" }}>
                  <span style={{ background: "var(--red)", color: "white", padding: "0.2rem 0.65rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>{n.tag}</span>
                  <span style={{ color: "var(--gray-500)", fontSize: "0.8rem" }}>{n.date}</span>
                </div>
                <h3 style={{ fontWeight: 700, color: "var(--green-dark)", lineHeight: 1.35, marginBottom: "0.75rem", fontSize: "1.02rem" }}>{n.title}</h3>
                <p style={{ color: "var(--gray-500)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{n.excerpt}</p>
                <a href="#" style={{ color: "var(--green)", fontWeight: 600, fontSize: "0.88rem", textDecoration: "none" }}>Read more →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ───────────────────────────────────────────────────
function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="gallery" style={{ padding: "6rem 0", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ color: "var(--red)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem", marginBottom: "0.75rem" }}>MOMENTS</div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "var(--green-dark)" }}>Photo Gallery</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {GALLERY_IMGS.map((img, i) => (
            <div key={i} className="fade-up" onClick={() => setLightbox(img)}
              style={{ cursor: "pointer", overflow: "hidden", borderRadius: 10, aspectRatio: "4/3", position: "relative" }}>
              <img src={img} alt={`Gallery ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,77,56,0.45)", opacity: 0, transition: "opacity 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.target.style.opacity = 1}
                onMouseLeave={e => e.target.style.opacity = 0}
              >
                <span style={{ color: "white", fontSize: "2rem" }}>🔍</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Gallery" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} />
          <button onClick={() => setLightbox(null)} aria-label="Close"
            style={{ position: "fixed", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer", borderRadius: 8, padding: "0.4rem 0.8rem" }}>✕</button>
        </div>
      )}

      <style>{`@media (max-width: 600px) { #gallery .grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </section>
  );
}

// ── Join Us ───────────────────────────────────────────────────
function JoinUs() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", district: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const districts = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", phone: "", district: "", message: "" });
  };

  return (
    <section id="join" style={{ padding: "6rem 0", background: "var(--green-dark)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ color: "var(--gold)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem", marginBottom: "0.75rem" }}>BE PART OF THE CHANGE</div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "white" }}>Join NDM Today</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 480, margin: "0.75rem auto 0", lineHeight: 1.8 }}>
            Become a member of Bangladesh's most dynamic student movement. Your voice matters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="fade-up" style={{ background: "white", borderRadius: 20, padding: "2.5rem", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "var(--green-dark)", fontSize: "0.88rem", marginBottom: "0.4rem" }}>Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" aria-label="Full Name" />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "var(--green-dark)", fontSize: "0.88rem", marginBottom: "0.4rem" }}>Email *</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" aria-label="Email" />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "var(--green-dark)", fontSize: "0.88rem", marginBottom: "0.4rem" }}>Phone *</label>
              <input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+880 1XXXXXXXXX" aria-label="Phone" />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "var(--green-dark)", fontSize: "0.88rem", marginBottom: "0.4rem" }}>District *</label>
              <select className="form-input" required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} aria-label="District">
                <option value="">Select district</option>
                {districts.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, color: "var(--green-dark)", fontSize: "0.88rem", marginBottom: "0.4rem" }}>Why do you want to join? *</label>
            <textarea className="form-input" rows={4} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about yourself and your motivation..." aria-label="Message" style={{ resize: "vertical" }} />
          </div>
          <button type="submit" style={{ width: "100%", background: "var(--green)", color: "white", padding: "1rem", borderRadius: 8, fontWeight: 700, border: "none", cursor: "pointer", fontSize: "1rem", transition: "background 0.25s" }}
            onMouseEnter={e => e.target.style.background = "var(--green-dark)"}
            onMouseLeave={e => e.target.style.background = "var(--green)"}
          >{submitted ? "✅ Application Submitted! We'll contact you soon." : "Submit Application →"}</button>
        </form>
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────
function Contact() {
  const [msg, setMsg] = useState({ name: "", email: "", text: "" });
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" style={{ padding: "6rem 0", background: "var(--off-white)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ color: "var(--red)", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.82rem", marginBottom: "0.75rem" }}>GET IN TOUCH</div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "var(--green-dark)" }}>Contact Us</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
          {/* Info */}
          <div className="fade-up">
            {[
              { icon: "📍", label: "Address", val: "NDM Central Office, 42 Purana Paltan, Dhaka-1000, Bangladesh" },
              { icon: "📞", label: "Phone", val: "+880 2-9517290" },
              { icon: "📧", label: "Email", val: "info@ndmstudent.org" },
              { icon: "⏰", label: "Hours", val: "Sun–Thu: 9AM – 6PM" },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ width: 44, height: 44, background: "var(--green)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--green-dark)", marginBottom: "0.2rem" }}>{label}</div>
                  <div style={{ color: "var(--gray-500)", lineHeight: 1.6 }}>{val}</div>
                </div>
              </div>
            ))}

            {/* Map embed */}
            <div style={{ borderRadius: 12, overflow: "hidden", height: 220, marginTop: "1rem" }}>
              <iframe
                title="NDM Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.4!2d90.4075!3d23.7261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQzJzMzLjkiTiA5MMKwMjQnMjYuNiJF!5e0!3m2!1sen!2sbd!4v1234"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="fade-up card-dark" style={{ background: "white", borderRadius: 16, padding: "2.25rem", border: "1px solid var(--gray-200)" }}>
            <h3 style={{ fontWeight: 700, color: "var(--green-dark)", marginBottom: "1.5rem" }}>Send a Message</h3>
            <form onSubmit={e => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 3500); setMsg({ name: "", email: "", text: "" }); }}>
              <div style={{ marginBottom: "1rem" }}>
                <input className="form-input" required placeholder="Your Name" value={msg.name} onChange={e => setMsg({ ...msg, name: e.target.value })} aria-label="Your Name" />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <input className="form-input" type="email" required placeholder="Email Address" value={msg.email} onChange={e => setMsg({ ...msg, email: e.target.value })} aria-label="Email Address" />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <textarea className="form-input" rows={5} required placeholder="Your message..." value={msg.text} onChange={e => setMsg({ ...msg, text: e.target.value })} aria-label="Message" style={{ resize: "vertical" }} />
              </div>
              <button type="submit" style={{ width: "100%", background: "var(--red)", color: "white", padding: "0.9rem", borderRadius: 8, fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.95rem", transition: "background 0.25s" }}
                onMouseEnter={e => e.target.style.background = "var(--red-dark)"}
                onMouseLeave={e => e.target.style.background = "var(--red)"}
              >{sent ? "✅ Message Sent!" : "Send Message →"}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{ background: "var(--gray-800)", color: "rgba(255,255,255,0.8)" }}>
      {/* Newsletter */}
      <div style={{ background: "var(--green)", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h3 className="font-display" style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Stay Connected with NDM</h3>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.25rem", fontSize: "0.92rem" }}>Get the latest news, event updates, and campaign alerts.</p>
          <form onSubmit={e => { e.preventDefault(); setSubscribed(true); setTimeout(() => setSubscribed(false), 3000); setEmail(""); }}
            style={{ display: "flex", gap: "0.75rem", maxWidth: 460, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              style={{ flex: 1, minWidth: 220, padding: "0.75rem 1rem", borderRadius: 8, border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem", outline: "none" }}
              aria-label="Newsletter email"
            />
            <button type="submit" style={{ background: "var(--red)", color: "white", padding: "0.75rem 1.5rem", borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
              {subscribed ? "✅ Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3.5rem 1.5rem 2rem", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2.5rem" }}>
        {/* Brand */}
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, color: "white", fontSize: "1.3rem", marginBottom: "0.25rem" }}>NDM Student Movement</div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: "1rem" }}>NATIONAL DEMOCRATIC MOVEMENT</div>
          <p style={{ fontSize: "0.88rem", lineHeight: 1.75, color: "rgba(255,255,255,0.55)", maxWidth: 280 }}>
            Building democratic values, youth leadership, and a just Bangladesh since 2007.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            {[
              { label: "Facebook", href: "#" },
              { label: "Twitter", href: "#" },
              { label: "YouTube", href: "#" },
              { label: "Instagram", href: "#" },
            ].map(({ label, href }) => (
              <a key={label} href={href} aria-label={label}
                style={{ width: 36, height: 36, background: "rgba(255,255,255,0.08)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 700, transition: "background 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.target.style.background = "var(--green)"; e.target.style.color = "white"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.08)"; e.target.style.color = "rgba(255,255,255,0.7)"; }}
              >{label[0]}</a>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          { title: "Organization", links: ["About Us", "Leadership", "History", "Vision & Mission"] },
          { title: "Programs", links: ["Activities", "Campaigns", "Digital Skills", "Scholarships"] },
          { title: "Connect", links: ["Contact", "Join Us", "News", "Gallery"] },
        ].map(({ title, links }) => (
          <div key={title}>
            <div style={{ fontWeight: 700, color: "white", marginBottom: "1rem", fontSize: "0.9rem", letterSpacing: "0.05em" }}>{title}</div>
            {links.map(link => (
              <a key={link} href="#" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", textDecoration: "none", marginBottom: "0.5rem", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--gold)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
              >{link}</a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1.25rem 1.5rem", textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)" }}>
        © 2026 NDM Student Movement. All rights reserved. | Designed for a Democratic Bangladesh 🇧🇩
      </div>

      <style>{`@media (max-width: 768px) { footer .grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </footer>
  );
}

// ── Scroll-to-Top ─────────────────────────────────────────────
function ScrollTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return visible ? (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top"
      style={{ position: "fixed", bottom: 28, right: 28, width: 48, height: 48, background: "var(--green)", color: "white", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", boxShadow: "0 4px 20px rgba(0,106,78,0.4)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}
      onMouseEnter={e => e.target.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.target.style.transform = "translateY(0)"}
    >↑</button>
  ) : null;
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useScrollAnimation();

  return (
    <>
      <GlobalStyles />
      <Loader hidden={!loading} />

      {/* SEO Meta (illustrative inline) */}
      <div style={{ display: "none" }}>
        <meta name="description" content="NDM Student Movement — Bangladesh's leading youth democratic organization. Join 50,000+ members across 64 districts." />
        <meta name="keywords" content="NDM, student movement, Bangladesh, youth, democratic, leadership" />
      </div>

      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Ticker />
      <Hero />
      <Stats />
      <About />
      <Leadership />
      <Activities />
      <News />
      <Gallery />
      <JoinUs />
      <Contact />
      <Footer />
      <ScrollTop />
    </>
  );
}
