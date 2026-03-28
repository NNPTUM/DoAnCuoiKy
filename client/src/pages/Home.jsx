import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: "'Inter', sans-serif", color: '#232c51' }}>

      {/* ===== TOP NAVBAR ===== */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        backgroundColor: 'rgba(247,245,255,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(35,44,81,0.07)',
        height: '64px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#1877F2', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px' }}>
            The Curator
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', backgroundColor: '#efefff',
            padding: '8px 16px', borderRadius: '999px', gap: '8px', minWidth: '260px'
          }}>
            <svg width="16" height="16" fill="none" stroke="#6c759e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search the community..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#232c51', width: '200px' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <svg width="22" height="22" fill="#6c759e" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
          </button>
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      </nav>

      {/* ===== MAIN LAYOUT ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '24px', paddingTop: '80px', padding: '80px 24px 40px', boxSizing: 'border-box' }}>

        {/* ===== LEFT SIDEBAR ===== */}
        <aside style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '80px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="https://i.pravatar.cc/150?img=11" alt="Alex Rivera" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Alex Rivera</p>
              <p style={{ fontSize: '12px', color: '#6c759e', margin: 0 }}>@curator_alex</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { icon: 'home', label: 'Feed', active: true, path: '/' },
              { icon: 'explore', label: 'Explore', active: false, path: '/explore' },
              { icon: 'mail', label: 'Messages', active: false, path: '/messages' },
              { icon: 'bookmark', label: 'Bookmarks', active: false, path: '/bookmarks' },
              { icon: 'settings', label: 'Settings', active: false, path: '/settings' },
            ].map(({ icon, label, active, path }) => (
              <a key={label} href="#" onClick={(e) => { e.preventDefault(); navigate(path); }} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 16px', borderRadius: '10px', textDecoration: 'none',
                fontWeight: active ? 700 : 500, fontSize: '14px',
                backgroundColor: active ? '#1877F2' : 'transparent',
                color: active ? '#fff' : '#6c759e',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#efefff'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                {label}
              </a>
            ))}
          </nav>

          {/* Create Post Button */}
          <button style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #0058bb, #4b8eff)',
            color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 14px rgba(0,88,187,0.25)', transition: 'opacity 0.2s',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <span style={{ fontSize: '20px', lineHeight: 1 }}>✚</span> Create Post
          </button>
        </aside>

        {/* ===== CENTER FEED ===== */}
        <main style={{ flex: 1, maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Create Post Box */}
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <img src="https://i.pravatar.cc/150?img=11" alt="Me" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <textarea
                  placeholder="Share your latest curation..."
                  rows={3}
                  style={{
                    width: '100%', background: '#f7f5ff', border: 'none', borderRadius: '10px',
                    padding: '12px', resize: 'none', fontSize: '14px', color: '#232c51',
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { icon: 'image', label: 'Image' },
                      { icon: 'videocam', label: 'Video' },
                      { icon: 'poll', label: 'Poll' },
                    ].map(({ icon, label }) => (
                      <button key={label} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#1877F2', fontSize: '13px', fontWeight: 600, padding: '6px 10px', borderRadius: '8px',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <button style={{
                    backgroundColor: '#1877F2', color: '#fff', border: 'none',
                    borderRadius: '999px', padding: '8px 22px', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  }}>Post</button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== POST 1 (Image) ===== */}
          <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '20px 20px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src="https://i.pravatar.cc/150?img=5" alt="Elena Chen" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Elena Chen</p>
                    <p style={{ fontSize: '12px', color: '#6c759e', margin: 0 }}>2 hours ago</p>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6c759e', fontSize: '20px' }}>···</button>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#232c51', margin: '0 0 12px' }}>
                The way morning light hits this minimalist architecture is just pure poetry. Exploring the intersection of form and light today. ✨
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop"
              alt="Architecture"
              style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f2f5' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[
                  { icon: 'favorite', label: '1.2k' },
                  { icon: 'chat_bubble', label: '84' },
                  { icon: 'share', label: '' },
                ].map(({ icon, label }) => (
                  <button key={icon} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6c759e', fontSize: '13px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6c759e' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bookmark</span>
              </button>
            </div>
          </article>

          {/* ===== POST 2 (Quote) ===== */}
          <article style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img src="https://i.pravatar.cc/150?img=8" alt="Julian Vance" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Julian Vance</p>
                  <p style={{ fontSize: '12px', color: '#6c759e', margin: 0 }}>5 hours ago</p>
                </div>
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6c759e', fontSize: '20px' }}>···</button>
            </div>

            <div style={{
              backgroundColor: '#efefff', padding: '20px', borderRadius: '12px', marginBottom: '14px',
              fontStyle: 'italic', color: '#232c51', textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '15px', lineHeight: '1.6'
            }}>
              "The interface is not the solution. The connection is."
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#232c51', margin: '0 0 14px' }}>
              Spent the morning thinking about how we can build better digital spaces that prioritize human well-being over metrics. What do you think?
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f0f2f5' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[
                  { icon: 'favorite', label: '432' },
                  { icon: 'chat_bubble', label: '156' },
                  { icon: 'share', label: '' },
                ].map(({ icon, label }) => (
                  <button key={icon} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6c759e', fontSize: '13px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6c759e' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              </button>
            </div>
          </article>

        </main>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '80px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Trending */}
          <section style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '15px', marginBottom: '16px' }}>Trending for you</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { cat: 'Design • Trending', tag: '#EditorialMinimalism', count: '12.4k posts' },
                { cat: 'Technology • Trending', tag: '#SpatialWeb', count: '8.9k posts' },
                { cat: 'Photography • Trending', tag: '#GoldenHourVibes', count: '25.1k posts' },
              ].map(({ cat, tag, count }) => (
                <div key={tag} style={{ cursor: 'pointer' }}>
                  <p style={{ fontSize: '11px', color: '#6c759e', margin: '0 0 2px' }}>{cat}</p>
                  <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 2px', color: '#232c51' }}>{tag}</p>
                  <p style={{ fontSize: '11px', color: '#6c759e', margin: 0 }}>{count}</p>
                </div>
              ))}
            </div>
            <button style={{ marginTop: '14px', background: 'transparent', border: 'none', color: '#1877F2', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}>Show more</button>
          </section>

          {/* Who to Follow */}
          <section style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '15px', marginBottom: '16px' }}>Who to follow</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Marcus K.', handle: '@marcus_visuals', img: 'https://i.pravatar.cc/150?img=12' },
                { name: 'Sarah J.', handle: '@sj_designs', img: 'https://i.pravatar.cc/150?img=9' },
              ].map(({ name, handle, img }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={img} alt={name} style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>{name}</p>
                      <p style={{ fontSize: '11px', color: '#6c759e', margin: 0 }}>{handle}</p>
                    </div>
                  </div>
                  <button style={{
                    backgroundColor: '#232c51', color: '#fff', border: 'none', borderRadius: '999px',
                    padding: '6px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  }}>Follow</button>
                </div>
              ))}
            </div>
            <button style={{ marginTop: '14px', background: 'transparent', border: 'none', color: '#1877F2', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}>Show more</button>
          </section>

          {/* Footer */}
          <footer style={{ padding: '0 4px', display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility'].map(t => (
              <a key={t} href="#" style={{ fontSize: '11px', color: '#a2abd7', textDecoration: 'none' }}>{t}</a>
            ))}
            <span style={{ fontSize: '11px', color: '#a2abd7' }}>© 2024 The Curator Inc.</span>
          </footer>
        </aside>

      </div>
    </div>
  );
};

export default Home;