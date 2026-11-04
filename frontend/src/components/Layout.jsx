import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about-us", label: "About" },
  { to: "/appointment", label: "Appointments" },
  { to: "/contact-us", label: "Contact" },
];

function Navbar() {
  const { isLoggedIn, profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 transition-colors ${isActive ? "text-brand font-bold" : "text-ink/80 hover:text-ink"}`;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-8 w-auto" />
          <span className="font-display text-lg font-bold">ElHakim AI</span>
        </Link>

        <button
          className="rounded-md p-2 md:hidden"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <nav
          id="main-nav"
          className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-16 flex-col gap-1 border-b border-line bg-paper p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
              {l.label}
            </NavLink>
          ))}
          {isLoggedIn ? (
            <>
              <NavLink to="/results" className={navClass}>
                My scans
              </NavLink>
              <button onClick={handleLogout} className="rounded-md px-3 py-2 text-left text-ink/80 hover:text-ink">
                Log out{profile ? ` (${profile.username})` : ""}
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navClass}>
              Log in
            </NavLink>
          )}
          <Link
            to="/ai-check"
            className="mt-2 rounded-lg bg-film px-4 py-2 text-center font-bold text-white hover:bg-film-2 md:mt-0 md:ml-2"
          >
            Analyse an X-ray
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-film text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-auto" />
            <span className="font-display text-lg font-bold text-white">ElHakim AI</span>
          </div>
          <p className="mt-4 max-w-sm text-sm">
            A student project that screens chest X-rays for pneumonia with a convolutional neural network. It is a demo,
            not a medical device: always confirm a result with a doctor.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-white">Pages</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/ai-check">Analyse an X-ray</Link></li>
            <li><Link className="hover:text-white" to="/appointment">Book an appointment</Link></li>
            <li><Link className="hover:text-white" to="/about-us">About the project</Link></li>
            <li><Link className="hover:text-white" to="/contact-us">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-white">Clinic (demo)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Rue Saïdani, Constantine</li>
            <li>contact@elhakim.dz</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-white/60">© {new Date().getFullYear()} ElHakim AI, student project.</p>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
