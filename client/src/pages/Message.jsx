import React, { useState } from 'react';

/* ─── Palette ─── */
const C = {
  bg:        '#16181f',
  panel:     '#1e2130',
  panelAlt:  '#252839',
  border:    '#2e3248',
  accent:    '#3b7ef8',
  accentDim: '#2563d4',
  textPri:   '#f0f2ff',
  textSec:   '#8b90b8',
  online:    '#22c55e',
  badge:     '#3b7ef8',
  bubbleOut: '#3b7ef8',
  bubbleIn:  '#252839',
};

const s = {
  fill: { width: '100%', height: '100%' },
  row:  { display: 'flex', alignItems: 'center' },
  col:  { display: 'flex', flexDirection: 'column' },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};

/* ─── Sample Data ─── */
const stories = [
  { id: 1, name: 'Your Story', src: 'https://i.pravatar.cc/150?img=47', isSelf: true },
  { id: 2, name: 'Julian',     src: 'https://i.pravatar.cc/150?img=8',  online: true },
  { id: 3, name: 'Marcus',     src: 'https://i.pravatar.cc/150?img=12', online: true },
];

const conversations = [
  { id: 1, name: 'Elena Vance',         handle: '@elenavance',  src: 'https://i.pravatar.cc/150?img=47', time: 'Just now', preview: 'The moodboards look incredible! Let\'s...', unread: true, active: true },
  { id: 2, name: 'Julian Casablancas',  src: 'https://i.pravatar.cc/150?img=8',  time: '24m ago', preview: 'Did you see the latest update from the dev tea...', unread: false },
  { id: 3, name: 'Design System Squad', src: null,              time: '1h ago',  preview: 'Alex: I\'ve updated the Figma file.', unread: false, group: true },
  { id: 4, name: 'Sarah Connor',        src: 'https://i.pravatar.cc/150?img=9',  time: '3h ago',  preview: 'I\'ll send you the details later tonight.', unread: false },
];

const messages = [
  { id: 1, from: 'elena', text: 'Hey! I just finished reviewing the new UI components you sent over.', time: '11:42 PM', type: 'text' },
  { id: 2, from: 'me',    text: 'Awesome! What did you think about the glassmorphism elements?', time: '11:45 PM', read: true, type: 'text' },
  { id: 3, from: 'elena', text: 'The moodboards look incredible! Let\'s go with the darker palette for the core messaging experience. It feels much more premium and focused. 🚀', time: '', type: 'text',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=140&fit=crop',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=140&fit=crop',
    ]
  },
  { id: 4, from: 'elena', text: '', time: 'Just now', type: 'typing' },
];

const sharedMedia = [
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1518341131753-3bc11f32a762?w=100&h=100&fit=crop',
];

/* ─── Sub-components ─── */
const Avatar = ({ src, size = 40, online = false, style = {} }) => (
  <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
    {src
      ? <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
      : <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={size * 0.55} height={size * 0.55} fill="white" viewBox="0 0 20 20"><path d="M13 6A3 3 0 1 1 7 6a3 3 0 0 1 6 0zm-9 11a7 7 0 1 1 14 0H4z"/></svg>
        </div>
    }
    {online && (
      <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: C.online, border: `2px solid ${C.panel}` }} />
    )}
  </div>
);

const IconBtn = ({ children, title }) => (
  <button title={title} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textSec, padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
    onMouseEnter={e => e.currentTarget.style.background = C.panelAlt}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    {children}
  </button>
);

/* ─── Main Component ─── */
export default function Message() {
  const [inputText, setInputText] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg, fontFamily: "'Inter', sans-serif", color: C.textPri, overflow: 'hidden' }}>

      {/* ── TOP NAV ── */}
      <nav style={{ height: 56, background: C.panel, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 10 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: C.accent, letterSpacing: '-0.5px' }}>The Curator</span>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: C.panelAlt, borderRadius: 999, padding: '7px 16px', gap: 8, minWidth: 260 }}>
          <svg width={14} height={14} fill="none" stroke={C.textSec} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input placeholder="Search conversations..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: C.textPri, width: 200 }} />
        </div>

        {/* Nav Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { title: 'Home', path: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
            { title: 'Explore', path: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v20M2 12h20' },
          ].map(({ title, path }) => (
            <IconBtn key={title} title={title}>
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path}/></svg>
            </IconBtn>
          ))}
          {/* Messages (active) */}
          <div style={{ background: C.accent, borderRadius: 10, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={20} height={20} fill="white" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
          </div>
          <IconBtn title="Notifications">
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17H9m3 4a3 3 0 01-3-3H6a2 2 0 01-2-2V8a6 6 0 1112 0v8a2 2 0 01-2 2h-3a3 3 0 01-3 3z"/></svg>
          </IconBtn>
          <Avatar src="https://i.pravatar.cc/150?img=11" size={34} />
        </div>
      </nav>

      {/* ── BODY (3 columns) ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT: Conversation List ── */}
        <aside style={{ width: 300, background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, margin: 0 }}>Messages</h2>
            <button style={{ background: C.accent, border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width={16} height={16} fill="white" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.21a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0L15.13 5.13l3.75 3.75 1.83-1.84z"/></svg>
            </button>
          </div>

          {/* Stories */}
          <div style={{ display: 'flex', gap: 12, padding: '0 20px 16px', overflowX: 'auto' }}>
            {stories.map(s => (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ padding: 2, borderRadius: '50%', background: s.isSelf ? C.panelAlt : 'linear-gradient(135deg,#3b7ef8,#a855f7)', position: 'relative' }}>
                  <Avatar src={s.src} size={48} online={s.online} />
                  {s.isSelf && (
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, background: C.accent, borderRadius: '50%', border: `2px solid ${C.panel}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 12, lineHeight: 1 }}>+</span>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: C.textSec }}>{s.name}</span>
              </div>
            ))}
          </div>

          {/* Conversation Items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(conv => (
              <div key={conv.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer',
                background: conv.active ? C.panelAlt : 'transparent',
                borderLeft: conv.active ? `3px solid ${C.accent}` : '3px solid transparent',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => { if (!conv.active) e.currentTarget.style.background = `${C.panelAlt}80`; }}
                onMouseLeave={e => { if (!conv.active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Avatar src={conv.src} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{conv.name}</span>
                    <span style={{ fontSize: 11, color: conv.unread ? C.accent : C.textSec, flexShrink: 0, marginLeft: 8 }}>{conv.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: C.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{conv.preview}</span>
                    {conv.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.badge, flexShrink: 0 }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: Chat Window ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, minWidth: 0 }}>
          {/* Chat Header */}
          <div style={{ height: 60, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, background: C.panel }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar src="https://i.pravatar.cc/150?img=47" size={38} online />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Elena Vance</p>
                <p style={{ fontSize: 12, margin: 0, color: C.online }}>Active now</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <IconBtn title="Call">
                <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              </IconBtn>
              <IconBtn title="Video">
                <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </IconBtn>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Date separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11, color: C.textSec, fontWeight: 600, letterSpacing: 1 }}>YESTERDAY</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {messages.map(msg => {
              const isMe = msg.from === 'me';

              if (msg.type === 'typing') return (
                <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <Avatar src="https://i.pravatar.cc/150?img=47" size={32} online />
                  <div>
                    <div style={{ background: C.bubbleIn, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                      {[0, 0.2, 0.4].map((d, i) => (
                        <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: C.textSec, animationDelay: `${d}s`, animation: 'bounce 1s infinite' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: C.textSec, margin: '4px 0 0', paddingLeft: 4 }}>Just now</p>
                  </div>
                </div>
              );

              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 4 }}>
                  {!isMe && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                      <Avatar src="https://i.pravatar.cc/150?img=47" size={32} />
                      <div style={{ maxWidth: '70%' }}>
                        {msg.text && (
                          <div style={{ background: C.bubbleIn, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', fontSize: 14, lineHeight: 1.5 }}>
                            {msg.text}
                          </div>
                        )}
                        {msg.images && (
                          <div style={{ display: 'flex', gap: 6, marginTop: msg.text ? 6 : 0 }}>
                            {msg.images.map((src, i) => (
                              <img key={i} src={src} alt="" style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 12 }} />
                            ))}
                          </div>
                        )}
                        {msg.time && <p style={{ fontSize: 11, color: C.textSec, margin: '4px 0 0', paddingLeft: 4 }}>{msg.time}</p>}
                      </div>
                    </div>
                  )}
                  {isMe && (
                    <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ background: C.bubbleOut, borderRadius: '18px 18px 4px 18px', padding: '12px 16px', fontSize: 14, lineHeight: 1.5 }}>
                        {msg.text}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: C.textSec }}>{msg.time}</span>
                        {msg.read && (
                          <svg width={14} height={14} viewBox="0 0 24 24" fill={C.accent}><path d="M9 12l2 2 4-4m5 .5a9.5 9.5 0 11-19 0 9.5 9.5 0 0119 0z" stroke={C.accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div style={{ padding: '12px 20px', background: C.panel, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.panelAlt, borderRadius: 999, padding: '8px 8px 8px 16px' }}>
              <IconBtn title="More">
                <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              </IconBtn>
              <IconBtn title="Media">
                <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </IconBtn>
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: C.textPri }}
              />
              <IconBtn title="Emoji">
                <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </IconBtn>
              <button style={{ background: C.accent, border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s' }}>
                <svg width={18} height={18} fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </main>

        {/* ── RIGHT: Contact Info ── */}
        <aside style={{ width: 280, background: C.panel, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          {/* Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ padding: 3, borderRadius: '50%', background: 'linear-gradient(135deg,#3b7ef8,#a855f7)', marginBottom: 12 }}>
              <Avatar src="https://i.pravatar.cc/150?img=47" size={80} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 17, margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Elena Vance</p>
            <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>@elenavance</p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
              {[
                { label: 'Profile',
                  icon: <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
                { label: 'Mute',
                  icon: <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg> },
                { label: 'Block',
                  icon: <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg> },
              ].map(({ label, icon }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.panelAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSec }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: 11, color: C.textSec }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: 1, margin: '0 0 8px', textTransform: 'uppercase' }}>Bio</p>
            <p style={{ fontSize: 13, color: C.textPri, lineHeight: 1.6, margin: 0 }}>
              Creative Director &amp; Digital Artist. Obsessed with minimalist architecture and fluid design systems.
            </p>
          </div>

          {/* Shared Media */}
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: 1, margin: 0, textTransform: 'uppercase' }}>Shared Media</p>
              <button style={{ background: 'transparent', border: 'none', color: C.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View All</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {sharedMedia.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} />
              ))}
              <div style={{ width: '100%', aspectRatio: '1', background: C.panelAlt, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ color: C.accent, fontSize: 14, fontWeight: 700 }}>+12</span>
              </div>
            </div>
          </div>

          {/* Privacy & Support */}
          <div style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: 1, margin: '0 0 12px', textTransform: 'uppercase' }}>Privacy &amp; Support</p>
            {[
              { icon: '⚠', label: 'Report Elena' },
              { icon: '🗑', label: 'Delete Conversation' },
            ].map(({ icon, label }) => (
              <button key={label} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: C.panelAlt, border: 'none', borderRadius: 10, padding: '12px 14px',
                color: C.textSec, fontSize: 13, cursor: 'pointer', marginBottom: 8, textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.border}
                onMouseLeave={e => e.currentTarget.style.background = C.panelAlt}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  {label}
                </div>
                <span style={{ fontSize: 16 }}>›</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
    </div>
  );
}
