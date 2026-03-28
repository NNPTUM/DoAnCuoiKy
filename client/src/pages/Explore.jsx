import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Color palette – matches Home.jsx light theme ─── */
const C = {
  bg:          '#f0f2f5',
  surface:     '#ffffff',
  surfaceAlt:  '#f7f5ff',
  border:      'rgba(35,44,81,0.08)',
  accent:      '#1877F2',
  accentBg:    '#eff6ff',
  text:        '#232c51',
  textSec:     '#6c759e',
  navActive:   '#1877F2',
  navActiveBg: '#eff6ff',
  pill:        '#f0f0f8',
  pillActive:  '#1877F2',
};

/* ─── Data ─── */
const categories = ['All', 'Art', 'Tech', 'Gaming', 'Food', 'Music', 'Photography'];

const leftNav = [
  { id: 'for-you',       label: 'For You',       icon: '✦',  iconType: 'text' },
  { id: 'trending',      label: 'Trending',       icon: 'trending_up' },
  { id: 'news',          label: 'News',           icon: 'newspaper' },
  { id: 'sports',        label: 'Sports',         icon: 'sports_soccer' },
  { id: 'entertainment', label: 'Entertainment',  icon: 'movie' },
];

const trendingTopics = [
  { cat: 'TECHNOLOGY · TRENDING', tag: '#AIRevolution',        count: '42.5k Posts', color: C.accent },
  { cat: 'GLOBAL · NEWS',         tag: 'Mars Settlement 2030', count: '108.1k Posts', color: C.text },
  { cat: 'GAMING · LIVE',         tag: 'The Witcher: New Moon', count: '15.2k Posts', color: C.text },
];

const whoToFollow = [
  { name: 'Sarah Chen',   handle: '@schen_art',   src: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Alex Rivera',  handle: '@rivera_flux',  src: 'https://i.pravatar.cc/150?img=12' },
];

const creatorPosts = [
  { id: 1, src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=400&fit=crop', likes: null,   views: null,  size: 'large',  col: 'col1' },
  { id: 2, src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop', likes: '12.1k', views: null,  size: 'small',  col: 'col2' },
  { id: 3, src: 'https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=300&h=200&fit=crop', likes: null,   views: '45.3k', size: 'small', col: 'col3' },
  { id: 4, src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop', likes: '8.9k',  views: null,  size: 'small',  col: 'col2' },
  { id: 5, src: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=320&fit=crop', likes: null,   views: null,  size: 'large',  col: 'col1' },
];

/* ─── Helpers ─── */
const Avatar = ({ src, size = 38 }) => (
  <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
);

export default function Explore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeNav, setActiveNav] = useState('for-you');
  const [refine, setRefine] = useState({ verified: true, recent: false, nearby: false });

  const navTo = (route) => navigate(route);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: "'Inter', sans-serif", color: C.text }}>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50, boxSizing: 'border-box',
        backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }}>
        {/* Brand + main nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: C.accent, letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navTo('/')}>The Curator</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ label: 'Home', route: '/' }, { label: 'Explore', route: '/explore' }, { label: 'Messages', route: '/messages' }].map(({ label, route }) => (
              <span key={label} onClick={() => navTo(route)} style={{
                fontSize: 14, fontWeight: route === '/explore' ? 700 : 500, cursor: 'pointer',
                color: route === '/explore' ? C.accent : C.textSec,
                borderBottom: route === '/explore' ? `2px solid ${C.accent}` : '2px solid transparent',
                paddingBottom: 2, transition: 'color 0.2s',
              }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Search + icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f0f0f8', borderRadius: 999, padding: '7px 16px', gap: 8, minWidth: 220 }}>
            <svg width={14} height={14} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input placeholder="Search The Curator..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: C.text, width: 160 }} />
          </div>
          <button onClick={() => {}} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%' }}>
            <svg width={20} height={20} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17H9m3 4a3 3 0 01-3-3H6a2 2 0 01-2-2V8a6 6 0 1112 0v8a2 2 0 01-2 2h-3a3 3 0 01-3 3z"/></svg>
          </button>
          <button onClick={() => navTo('/messages')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%' }}>
            <svg width={20} height={20} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
          </button>
          <img src="https://i.pravatar.cc/150?img=11" alt="" style={{ width: 34, height: 34, borderRadius: '50%', cursor: 'pointer' }} />
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 24, paddingTop: 76, padding: '76px 24px 40px', boxSizing: 'border-box' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{ width: 200, flexShrink: 0, position: 'sticky', top: 76, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, margin: '0 0 2px' }}>Explore</h2>
            <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>Discover the world</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {leftNav.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setActiveNav(id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeNav === id ? C.navActiveBg : 'transparent',
                color: activeNav === id ? C.navActive : C.textSec,
                fontWeight: activeNav === id ? 700 : 500, fontSize: 14, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (activeNav !== id) e.currentTarget.style.background = '#f5f5fa'; }}
                onMouseLeave={e => { if (activeNav !== id) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: activeNav === id ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div style={{ height: 1, background: C.border, margin: '12px 0' }} />

          <button onClick={() => navTo('/settings')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: C.textSec, fontSize: 14, fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5fa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
            Settings
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: C.textSec, fontSize: 14, fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5fa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>help</span>
            Help
          </button>

          <button onClick={() => navTo('/')} style={{
            marginTop: 16, width: '100%', padding: '12px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0058bb, #4b8eff)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(0,88,187,0.25)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            ✚ Create Post
          </button>
        </aside>

        {/* ── CENTER ── */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: activeCategory === cat ? C.pillActive : C.pill,
                color: activeCategory === cat ? '#fff' : C.textSec,
                transition: 'all 0.15s',
              }}>
                {cat}
              </button>
            ))}
          </div>

          {/* ── FEATURE HERO CARD ── */}
          <div style={{
            position: 'relative', borderRadius: 20, overflow: 'hidden',
            height: 320, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          }}>
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&h=400&fit=crop"
              alt="Feature"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

            {/* Badge */}
            <div style={{
              position: 'absolute', top: 20, left: 20,
              background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '4px 12px', borderRadius: 999, letterSpacing: 0.5,
            }}>LIVE EVENT</div>

            {/* Text */}
            <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', margin: '0 0 10px', lineHeight: 1.25 }}>
                Neo-Tokyo Virtual Gallery: The Future of Digital Expression
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 18px' }}>
                Join 12,000 others exploring the latest in immersive 3D art installations and interactive neural networks.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button style={{ background: '#fff', color: C.text, border: 'none', borderRadius: 999, padding: '9px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Explore Now
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {['47', '8', '12'].map((img, i) => (
                    <img key={i} src={`https://i.pravatar.cc/150?img=${img}`} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid white', marginLeft: i > 0 ? -10 : 0 }} />
                  ))}
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginLeft: 6, fontWeight: 600 }}>+12k</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── TRENDING CREATORS ── */}
          <div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, margin: '0 0 16px' }}>Trending Creators</h3>

            {/* Masonry-style grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: 10 }}>
              {/* Large featured card */}
              <div style={{ gridRow: '1 / 3', position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', background: '#111' }}>
                <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=500&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                <div style={{ position: 'absolute', top: 10, left: 10, background: C.accent, borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width={14} height={14} fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>

              {/* Top-right small */}
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' }}>
                <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=220&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width={13} height={13} fill="#ef4444" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>12.1k</span>
                </div>
              </div>

              {/* Top-right #2 */}
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' }}>
                <img src="https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=300&h=220&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width={13} height={13} fill="white" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>45.3k</span>
                </div>
              </div>

              {/* Bottom-right small */}
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' }}>
                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=220&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width={13} height={13} fill="#ef4444" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>8.9k</span>
                </div>
              </div>

              {/* Bottom-right #2 */}
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' }}>
                <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=220&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>

          {/* ── MORE POST GRID ── */}
          <div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, margin: '0 0 16px' }}>More to Discover</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=200&fit=crop',
                'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=300&h=200&fit=crop',
                'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=300&h=200&fit=crop',
                'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&h=200&fit=crop',
                'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=300&h=200&fit=crop',
                'https://images.unsplash.com/photo-1510784722466-f2aa240a5f29?w=300&h=200&fit=crop',
              ].map((src, i) => (
                <div key={i} style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3', position: 'relative' }}
                  onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 76, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Refine Search */}
          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, margin: '0 0 14px' }}>Refine Search</p>
            {[
              { key: 'verified', label: 'Verified Creators' },
              { key: 'recent',   label: 'Recent First' },
              { key: 'nearby',   label: 'Nearby Location' },
            ].map(({ key, label }) => (
              <div key={key} onClick={() => setRefine(r => ({ ...r, [key]: !r[key] }))} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: `2px solid ${refine[key] ? C.accent : '#d1d5db'}`,
                  background: refine[key] ? C.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
                }}>
                  {refine[key] && <svg width={10} height={10} fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                </div>
                <span style={{ fontSize: 13, fontWeight: refine[key] ? 600 : 400, color: refine[key] ? C.text : C.textSec }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Trending for you */}
          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, margin: 0 }}>Trending for you</p>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textSec }}>
                <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {trendingTopics.map(({ cat, tag, count, color }) => (
                <div key={tag} style={{ cursor: 'pointer' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.textSec, letterSpacing: 0.5, margin: '0 0 3px', textTransform: 'uppercase' }}>{cat}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color, margin: '0 0 2px' }}>{tag}</p>
                  <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>{count}</p>
                </div>
              ))}
            </div>
            <button style={{ marginTop: 14, background: 'transparent', border: 'none', color: C.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Show more</button>
          </div>

          {/* Who to follow */}
          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, margin: '0 0 14px' }}>Who to follow</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {whoToFollow.map(({ name, handle, src }) => (
                <div key={handle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar src={src} size={38} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{name}</p>
                      <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>{handle}</p>
                    </div>
                  </div>
                  <button style={{ background: '#232c51', color: '#fff', border: 'none', borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.accent}
                    onMouseLeave={e => e.currentTarget.style.background = '#232c51'}
                  >Follow</button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', padding: '0 4px' }}>
            {['Terms', 'Privacy', 'Cookies', 'Accessibility'].map(t => (
              <a key={t} href="#" style={{ fontSize: 11, color: '#a2abd7', textDecoration: 'none' }}>{t}</a>
            ))}
            <span style={{ fontSize: 11, color: '#a2abd7' }}>© 2024 The Curator</span>
          </div>
        </aside>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}
