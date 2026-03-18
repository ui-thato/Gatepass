import React, { useState } from 'react';

// Rover fleet data
const rovers = [
  { name: 'Pathfinder X1', model: 'Explorer Pro',  status: 'Available',  rate: '$340/day', location: 'Olympus Mons Base',  canRent: true  },
  { name: 'Red Drifter',   model: 'Terrain Max',   status: 'Available',  rate: '$520/day', location: 'Valles Marineris',     canRent: true  },
  { name: 'Dust Runner',   model: 'Scout Lite',    status: 'Reserved',   rate: '$180/day', location: 'Gale Crater',          canRent: false },
  { name: 'Canyon Hawk',   model: 'Heavy Cargo',   status: 'Available',  rate: '$780/day', location: 'Jezero Crater',        canRent: true  },
  { name: 'Polar Scout',   model: 'Ice Breaker',   status: 'In Service', rate: '$450/day', location: 'North Polar Cap',      canRent: false },
  { name: 'Arsia Nomad',   model: 'Explorer Pro',  status: 'Available',  rate: '$340/day', location: 'Arsia Mons',           canRent: true  },
];

type StatusKey = 'Available' | 'Reserved' | 'In Service';

const statusStyles: Record<StatusKey, { background: string; color: string }> = {
  Available:    { background: '#222924', color: '#B6FFCE' },
  Reserved:     { background: '#291C0F', color: '#FF8400' },
  'In Service': { background: '#2E2E2E', color: '#FFFFFF' },
};

const navSections = [
  {
    title: 'Management',
    items: [
      { label: 'Dashboard',   icon: 'dashboard'      },
      { label: 'Fleet',       icon: 'directions_car' },
      { label: 'Missions',    icon: 'explore'        },
      { label: 'Maintenance', icon: 'build'          },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports',  icon: 'bar_chart' },
      { label: 'Settings', icon: 'settings'  },
    ],
  },
];

const stats = [
  { label: 'Total Rovers', value: '24', color: '#FFFFFF', icon: 'smart_toy',     iconColor: '#B8B9B6' },
  { label: 'Available',    value: '18', color: '#B6FFCE', icon: 'check_circle',  iconColor: '#B6FFCE' },
  { label: 'On Mission',   value: '6',  color: '#FF8400', icon: 'rocket_launch', iconColor: '#FF8400' },
];

const theme = {
  background:      '#111111',
  card:            '#1A1A1A',
  border:          '#2E2E2E',
  foreground:      '#FFFFFF',
  mutedForeground: '#B8B9B6',
  primary:         '#FF8400',
  primaryFg:       '#111111',
  sidebar:         '#18181b',
  sidebarAccent:   '#2a2a30',
  fontPrimary:     "'JetBrains Mono', monospace",
  fontSecondary:   "'Geist', sans-serif",
};

const card: React.CSSProperties = {
  background:   theme.card,
  border:       `1px solid ${theme.border}`,
  borderRadius: 16,
};

export default function RoverDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [search, setSearch]       = useState('');

  const filteredRovers = rovers.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: theme.background, color: theme.foreground, overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 280, flexShrink: 0,
        background: theme.sidebar,
        borderRight: `1px solid rgba(255,255,255,0.1)`,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 24px 20px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: theme.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-sharp" style={{ fontSize: 20, color: theme.primaryFg, fontVariationSettings: "'wght' 100" }}>
              rocket_launch
            </span>
          </div>
          <span style={{ fontFamily: theme.fontPrimary, fontWeight: 600, fontSize: 16 }}>ROVER HQ</span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
          {navSections.map((section) => (
            <div key={section.title} style={{ marginBottom: 8 }}>
              <p style={{
                margin: '12px 0 4px', padding: '0 8px',
                fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase',
                color: theme.mutedForeground, fontFamily: theme.fontSecondary,
              }}>
                {section.title}
              </p>

              {section.items.map((item) => {
                const isActive = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveNav(item.label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', padding: '8px 12px', marginBottom: 2,
                      borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: isActive ? theme.sidebarAccent : 'transparent',
                      color: isActive ? '#fafafa' : theme.mutedForeground,
                      fontFamily: theme.fontSecondary, fontSize: 14,
                      fontWeight: isActive ? 500 : 400,
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    <span className="material-symbols-sharp" style={{ fontSize: 20, fontVariationSettings: "'wght' 100" }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: theme.border,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, flexShrink: 0,
            }}>
              JD
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, fontFamily: theme.fontSecondary }}>Jon Doe</p>
              <p style={{ margin: 0, fontSize: 12, color: theme.mutedForeground, fontFamily: theme.fontSecondary }}>
                jon@acmecorp.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', boxSizing: 'border-box' }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, fontFamily: theme.fontPrimary }}>
                Rover Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: theme.mutedForeground, fontFamily: theme.fontSecondary }}>
                Monitor and manage your rover fleet
              </p>
            </div>
            <button style={{
              background: theme.primary, color: theme.primaryFg,
              border: 'none', borderRadius: 8,
              padding: '10px 20px',
              fontFamily: theme.fontSecondary, fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}>
              + Add Rover
            </button>
          </div>

          {/* Stats cards */}
          <div style={{ display: 'flex', gap: 16 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ ...card, flex: 1, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: theme.mutedForeground, fontFamily: theme.fontSecondary }}>
                    {stat.label}
                  </span>
                  <span className="material-symbols-sharp" style={{ fontSize: 20, color: stat.iconColor, fontVariationSettings: "'wght' 100" }}>
                    {stat.icon}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 600, color: stat.color, fontFamily: theme.fontPrimary }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Fleet table */}
          <div style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Search / filter bar */}
            <div style={{
              padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${theme.border}`,
            }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rovers…"
                style={{
                  background: theme.border, border: `1px solid ${theme.border}`, borderRadius: 8,
                  padding: '8px 16px', color: theme.foreground,
                  fontFamily: theme.fontSecondary, fontSize: 14,
                  width: 260, outline: 'none',
                }}
              />
              <button style={{
                background: theme.border, color: theme.foreground,
                border: `1px solid ${theme.border}`, borderRadius: 8,
                padding: '8px 20px', fontFamily: theme.fontSecondary, fontSize: 14,
                cursor: 'pointer',
              }}>
                Filter
              </button>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  {['Rover Name', 'Model', 'Status', 'Daily Rate', 'Location', 'Action'].map((col) => (
                    <th key={col} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 14, fontWeight: 500,
                      color: theme.mutedForeground, fontFamily: theme.fontSecondary,
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRovers.map((rover, i) => {
                  const s = statusStyles[rover.status as StatusKey] ?? { background: theme.border, color: theme.foreground };
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, fontFamily: theme.fontSecondary, width: 180 }}>
                        {rover.name}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: theme.mutedForeground, fontFamily: theme.fontSecondary, width: 140 }}>
                        {rover.model}
                      </td>
                      <td style={{ padding: '14px 16px', width: 120 }}>
                        <span style={{
                          ...s, borderRadius: 999,
                          padding: '4px 12px', fontSize: 12, fontWeight: 500,
                          fontFamily: theme.fontSecondary, whiteSpace: 'nowrap',
                          display: 'inline-block',
                        }}>
                          {rover.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontFamily: theme.fontSecondary, width: 120 }}>
                        {rover.rate}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: theme.mutedForeground, fontFamily: theme.fontSecondary }}>
                        {rover.location}
                      </td>
                      <td style={{ padding: '14px 16px', width: 100 }}>
                        {rover.canRent && (
                          <button style={{
                            background: 'transparent', color: theme.mutedForeground,
                            border: `1px solid ${theme.border}`, borderRadius: 8,
                            padding: '6px 16px', fontFamily: theme.fontSecondary, fontSize: 14,
                            cursor: 'pointer',
                          }}>
                            Rent
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div style={{
              padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: `1px solid ${theme.border}`,
            }}>
              <span style={{ fontSize: 14, color: theme.mutedForeground, fontFamily: theme.fontSecondary }}>
                Showing 6 of 18 available rovers
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Previous', 'Next'].map((label) => (
                  <button key={label} style={{
                    background: theme.border, color: theme.mutedForeground,
                    border: `1px solid ${theme.border}`, borderRadius: 8,
                    padding: '6px 16px', fontSize: 14, fontFamily: theme.fontSecondary,
                    cursor: 'pointer',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
