import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Colour palette – matches Home / Explore light theme ─── */
const C = {
  bg:         '#f0f2f5',
  surface:    '#ffffff',
  border:     'rgba(35,44,81,0.08)',
  accent:     '#1877F2',
  accentBg:   '#eff6ff',
  text:       '#232c51',
  textSec:    '#6c759e',
  pillActive: '#1877F2',
  pill:       '#f0f0f8',
};

/* ─── Data ─── */
const folders = [
  { id: 'all',    label: 'All Bookmarks',    count: 124, icon: 'folder',         color: '#1877F2' },
  { id: 'design', label: 'Design Inspos',    count: 42,  icon: 'palette',        color: '#a855f7' },
  { id: 'tech',   label: 'Tech Reads',       count: 18,  icon: 'computer',       color: '#0ea5e9' },
  { id: 'recipe', label: 'Recipe Collection',count: 12,  icon: 'restaurant',     color: '#f97316' },
  { id: 'person', label: 'Personal',         count: 56,  icon: 'favorite',       color: '#ef4444' },
];

const sortOptions = ['Recent', 'Oldest', 'Most Liked', 'Alphabetical'];

const bookmarks = [
  {
    id: 1,
    avatar: 'https://i.pravatar.cc/150?img=34',
    author: 'Sarah Jenkins',
    savedTime: 'Saved 2 hours ago',
    folder: 'Design Inspiration',
    folderColor: '#a855f7',
    title: 'The Future of Minimalist UI in 2025',
    excerpt: 'As we move towards more organic interfaces, the traditional grid is being replaced by fluid layouts that prioritize content hierarchy over rigid structural containers...',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&h=360&fit=crop',
    hasImage: true,
  },
  {
    id: 2,
    avatar: null,
    avatarText: 'TR',
    avatarColor: '#0ea5e9',
    author: 'Tech Radar Weekly',
    savedTime: 'Saved 1 day ago',
    folder: 'Tech Reads',
    folderColor: '#0ea5e9',
    title: 'Why Rust is the new standard for performance-critical web applications',
    excerpt: 'Safety, speed, and concurrency without a garbage collector. Developers are flocking to Rust for its unique memory management model that prevents common bugs...',
    hasImage: false,
  },
  {
    id: 3,
    avatar: 'https://i.pravatar.cc/150?img=13',
    author: 'Marcus Thorne',
    savedTime: 'Saved 3 days ago',
    folder: 'Recipe Collection',
    folderColor: '#f97316',
    title: 'Summer Harvest: 10 Mediterranean Classics',
    excerpt: 'Fresh ingredients, bold flavors, and centuries of culinary tradition. Discover the dishes that define Mediterranean summer cooking from coast to coast.',
    images: [
      'https://images.unsplash.com/photo-1550317138-10000687a72b?w=300&h=180&fit=crop',
      'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=300&h=180&fit=crop',
    ],
    hasImage: true,
    multiImg: true,
  },
  {
    id: 4,
    avatar: 'https://i.pravatar.cc/150?img=5',
    author: 'Elena Vance',
    savedTime: 'Saved 5 days ago',
    folder: 'Design Inspiration',
    folderColor: '#a855f7',
    title: 'Glassmorphism vs Neumorphism: Which wins in 2025?',
    excerpt: 'Two dominant design languages battle it out. We examined 50 top products to determine which visual philosophy resonates more with modern users...',
    hasImage: false,
  },
];

/* ─── Small helpers ─── */
const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
    background: active ? C.accentBg : 'transparent',
    color: active ? C.accent : C.textSec,
    fontWeight: active ? 700 : 500, fontSize: 14,
    borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
    transition: 'all 0.15s', textAlign: 'left',
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5fa'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
    {label}
  </button>
);

export default function Bookmarks() {
  const navigate = useNavigate();
  const [activeFolder, setActiveFolder] = useState('all');
  const [sort, setSort]                 = useState('Recent');
  const [search, setSearch]             = useState('');
  const [removed, setRemoved]           = useState([]);

  const visible = bookmarks.filter(b => !removed.includes(b.id) && (
    search === '' ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: "'Inter', sans-serif", color: C.text }}>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50, boxSizing: 'border-box',
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }}>
        <span onClick={() => navigate('/')} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 20, color: C.accent, letterSpacing: '-0.5px', cursor: 'pointer' }}>
          The Curator
        </span>

        <div style={{ display: 'flex', alignItems: 'center', background: '#f0f0f8', borderRadius: 999, padding: '7px 16px', gap: 8, minWidth: 260 }}>
          <svg width={14} height={14} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input placeholder="Search curated content..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: C.text, width: 200 }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg width={20} height={20} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17H9m3 4a3 3 0 01-3-3H6a2 2 0 01-2-2V8a6 6 0 1112 0v8a2 2 0 01-2 2h-3a3 3 0 01-3 3z"/></svg>
          </button>
          <img src="https://i.pravatar.cc/150?img=11" alt="" style={{ width: 34, height: 34, borderRadius: '50%', cursor: 'pointer' }} />
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24, paddingTop: 76, padding: '76px 24px 40px', boxSizing: 'border-box' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{ width: 210, flexShrink: 0, position: 'sticky', top: 76, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Profile mini-card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 0 20px', background: C.surface, borderRadius: 14, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <img src="https://i.pravatar.cc/150?img=11" alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${C.accentBg}` }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Alex Curator</p>
              <p style={{ fontSize: 11, color: C.textSec, margin: '2px 0 0' }}>Premium Member</p>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <NavItem icon="home"     label="Feed"      onClick={() => navigate('/')} />
            <NavItem icon="explore"  label="Explore"   onClick={() => navigate('/explore')} />
            <NavItem icon="mail"     label="Messages"  onClick={() => navigate('/messages')} />
            <NavItem icon="bookmark" label="Bookmarks" active onClick={() => {}} />
            <NavItem icon="settings" label="Settings"  onClick={() => navigate('/settings')} />
          </nav>

          <button onClick={() => navigate('/')} style={{
            marginTop: 16, width: '100%', padding: 12, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0058bb, #4b8eff)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(0,88,187,0.25)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            ✚ Create Post
          </button>
        </aside>

        {/* ── CENTER FEED ── */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 26, margin: 0 }}>Your Bookmarks</h1>
          </div>

          {/* Search + Sort */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: C.surface, borderRadius: 10, padding: '10px 16px', gap: 10, border: `1px solid ${C.border}` }}>
              <svg width={16} height={16} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                placeholder="Search your saved items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: C.text, width: '100%' }}
              />
            </div>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  appearance: 'none', background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '10px 36px 10px 14px', fontSize: 14, color: C.text,
                  fontWeight: 600, cursor: 'pointer', outline: 'none',
                }}
              >
                {sortOptions.map(o => <option key={o}>{o}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width={14} height={14} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          {/* Bookmark cards */}
          {visible.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: C.textSec }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>bookmark_border</span>
              <p style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>No bookmarks found</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search or add some!</p>
            </div>
          )}

          {visible.map(b => (
            <article key={b.id} style={{ background: C.surface, borderRadius: 16, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
            >
              {/* Author row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {b.avatar
                    ? <img src={b.avatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 38, height: 38, borderRadius: '50%', background: b.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>{b.avatarText}</div>
                  }
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{b.author}</p>
                    <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>
                      {b.savedTime}
                      {b.folder && <> · <span style={{ color: b.folderColor, fontWeight: 600 }}>{b.folder}</span></>}
                    </p>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textSec, fontSize: 20, lineHeight: 1, padding: '2px 6px', borderRadius: 6 }}>···</button>
              </div>

              {/* Title + excerpt */}
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 17, margin: '0 0 8px', lineHeight: 1.35, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = C.accent}
                onMouseLeave={e => e.currentTarget.style.color = C.text}
              >{b.title}</h3>
              <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.6, margin: '0 0 14px' }}>{b.excerpt}</p>

              {/* Image(s) */}
              {b.hasImage && !b.multiImg && (
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                  <img src={b.image} alt="" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              {b.hasImage && b.multiImg && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                  {b.images.map((src, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '16/10' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: C.textSec, fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l5.662-3.774M8.684 10.658l5.662 3.774m0 0a3 3 0 105.368-2.684 3 3 0 00-5.368 2.684zm0-9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  Share
                </button>
                <button onClick={() => setRemoved(r => [...r, b.id])} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bookmark_remove</span>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </main>

        {/* ── RIGHT SIDEBAR: FOLDERS ── */}
        <aside style={{ width: 240, flexShrink: 0, position: 'sticky', top: 76, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Folders */}
          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 1, margin: 0, textTransform: 'uppercase', color: C.textSec }}>Folders</p>
              <button style={{ background: C.accent, border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 18, lineHeight: 1 }}>+</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {folders.map(f => (
                <button key={f.id} onClick={() => setActiveFolder(f.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: activeFolder === f.id ? C.accentBg : 'transparent',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { if (activeFolder !== f.id) e.currentTarget.style.background = '#f5f5fa'; }}
                  onMouseLeave={e => { if (activeFolder !== f.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Folder icon colored square */}
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 17, color: f.color, fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: activeFolder === f.id ? 700 : 500, color: activeFolder === f.id ? C.accent : C.text }}>{f.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.textSec }}>{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pro Tip card */}
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f0ff)', borderRadius: 16, padding: '18px 20px', border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: C.accent, margin: '0 0 8px', textTransform: 'uppercase' }}>💡 PRO TIP</p>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: '0 0 12px' }}>Organize your saved content by dragging items directly into folders on the right.</p>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13, fontWeight: 700, padding: 0 }}>Learn more</button>
          </div>

          {/* Stats */}
          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 1, margin: '0 0 14px', textTransform: 'uppercase', color: C.textSec }}>Stats</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Saved',   value: '124' },
                { label: 'This Week',     value: '+8' },
                { label: 'Most Saved',    value: 'Design' },
                { label: 'Oldest',        value: '6 mo ago' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#f7f5ff', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.textSec, letterSpacing: 0.5, margin: '0 0 4px', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{value}</p>
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
