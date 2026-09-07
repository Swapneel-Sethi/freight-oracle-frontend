import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Command', icon: '◆' },
  { path: '/forecast', label: 'Forecast', icon: '📈' },
  { path: '/optimize', label: 'Optimize', icon: '⚡' },
  { path: '/demurrage', label: 'Demurrage', icon: '⏱️' },
  { path: '/fleet', label: 'Fleet', icon: '🗺️' },
  { path: '/warroom', label: 'War Room', icon: '[CRISIS]' },
  { path: '/admin', label: 'Admin', icon: '⚙️' },
]

export default function Navigation() {
  return (
    <nav style={styles.nav}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <span style={styles.icon}>{item.icon}</span>
          <span style={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(11, 14, 26, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(220, 38, 38, 0.35)',
  },
  link: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '14px',
    textDecoration: 'none',
    color: '#8B8FA3',
    transition: 'all 0.2s',
    fontSize: '11px',
  },
  activeLink: {
    color: '#F59E0B',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  icon: {
    fontSize: '18px',
    marginBottom: '2px',
  },
  label: {
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
}