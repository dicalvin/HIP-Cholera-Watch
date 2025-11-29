import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Layout({ children, loading, summary }) {
  const totals = summary || { totalReports: 0, totalConfirmed: 0 }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navLinks = [
    { to: '/', label: 'Overview', end: true },
    { to: '/analytics', label: 'Analytics & Filters' },
    { to: '/response-insights', label: 'Response Insights' },
    { to: '/early-warning', label: 'Early Warning' },
    { to: '/weather', label: 'Weather' },
    { to: '/resource-planning', label: 'Resource Planning' },
  ]

  return (
    <div className="app-shell">
      <motion.nav
        className="top-nav"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="brand">
          <div className="brand-primary">
            <span>Health Intelligence</span>
            <strong>Platform</strong>
          </div>
          <small className="brand-secondary">Cholera Watch</small>
        </div>
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={mobileMenuOpen ? 'open' : ''} />
          <span className={mobileMenuOpen ? 'open' : ''} />
          <span className={mobileMenuOpen ? 'open' : ''} />
        </button>
        <AnimatePresence>
          {(!isMobile || mobileMenuOpen) && (
            <motion.div
              className="nav-links"
              initial={isMobile ? { opacity: 0, height: 0 } : false}
              animate={isMobile ? { opacity: 1, height: 'auto' } : {}}
              exit={isMobile ? { opacity: 0, height: 0 } : {}}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="nav-meta">
          {loading ? (
            <span>Loading data…</span>
          ) : (
            <>
              <span>{totals.totalReports.toLocaleString()} reports</span>
              <span>{totals.totalConfirmed.toLocaleString()} confirmed cases</span>
            </>
          )}
        </div>
      </motion.nav>
      <main>{children}</main>
    </div>
  )
}

export default Layout

