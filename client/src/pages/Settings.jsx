import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [theme, setTheme] = useState("light");
  const [activeStatus, setActiveStatus] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Alex Henderson",
    username: "@alexh_curator",
    email: "alex.henderson@example.com",
  });
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const navItems = [
    {
      id: "account",
      label: "Account",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: "display",
      label: "Display",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: "help",
      label: "Help",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  const Toggle = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "13px",
        backgroundColor: checked ? "#2f6aff" : "#d1d5db",
        cursor: "pointer",
        position: "relative",
        transition: "background-color 0.25s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: checked ? "25px" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.25s ease",
        }}
      />
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      {/* Top Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>The Curator</div>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/explore" style={styles.navLink}>Explore</Link>
          <Link to="/settings" style={{ ...styles.navLink, ...styles.navLinkActive }}>Settings</Link>
        </div>
        <div style={styles.navIcons}>
          <button style={styles.iconBtn} title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button style={styles.iconBtn} title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <div style={styles.avatarCircle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Settings</h3>
            <p style={styles.sidebarSubtitle}>Manage your experience</p>
          </div>
          <nav style={styles.sideNav}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...styles.sideNavItem,
                  ...(activeTab === item.id ? styles.sideNavItemActive : {}),
                }}
              >
                <span style={{ color: activeTab === item.id ? "#2f6aff" : "#6b7280" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button style={styles.saveBtn}>Save Changes</button>
        </aside>

        {/* Content */}
        <main style={styles.content}>
          <div style={styles.contentHeader}>
            <h1 style={styles.contentTitle}>Account Settings</h1>
            <p style={styles.contentSubtitle}>
              Update your profile information and manage how others see you on the platform.
            </p>
          </div>

          {/* Profile + Appearance Row */}
          <div style={styles.row}>
            {/* Profile Card */}
            <div style={{ ...styles.card, flex: 2 }}>
              <div style={styles.profileRow}>
                {/* Avatar */}
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatarLarge}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="#5b6eae">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <button style={styles.editAvatarBtn} title="Edit photo">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>

                {/* Fields */}
                <div style={styles.fieldsGrid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>FULL NAME</label>
                    <input
                      style={styles.fieldInput}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>USERNAME</label>
                    <input
                      style={styles.fieldInput}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div style={{ ...styles.fieldGroup, gridColumn: "span 2" }}>
                    <label style={styles.fieldLabel}>EMAIL ADDRESS</label>
                    <input
                      style={styles.fieldInput}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance Card */}
            <div style={{ ...styles.card, flex: 1, minWidth: "200px" }}>
              <h3 style={styles.cardTitle}>Appearance</h3>
              <p style={styles.cardSubtitle}>Choose your preferred visual theme for the interface.</p>
              <div style={styles.themeRow}>
                <button
                  id="theme-light"
                  onClick={() => setTheme("light")}
                  style={{
                    ...styles.themeBtn,
                    ...(theme === "light" ? styles.themeBtnActive : {}),
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme === "light" ? "#2f6aff" : "#6b7280"} strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: theme === "light" ? "#2f6aff" : "#6b7280", marginTop: "4px" }}>LIGHT</span>
                </button>
                <button
                  id="theme-dark"
                  onClick={() => setTheme("dark")}
                  style={{
                    ...styles.themeBtn,
                    ...(theme === "dark" ? styles.themeBtnActive : {}),
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={theme === "dark" ? "#2f6aff" : "none"} stroke={theme === "dark" ? "#2f6aff" : "#6b7280"} strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: theme === "dark" ? "#2f6aff" : "#6b7280", marginTop: "4px" }}>DARK</span>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy + Account Health Row */}
          <div style={styles.row}>
            {/* Privacy Controls */}
            <div style={{ ...styles.card, flex: 1 }}>
              <div style={styles.privacyHeader}>
                <div style={styles.privacyIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2f6aff" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1a2e" }}>Privacy Controls</h3>
              </div>

              <div style={styles.privacyItem}>
                <div>
                  <div style={styles.privacyItemTitle}>Active Status</div>
                  <div style={styles.privacyItemDesc}>Show when you're online</div>
                </div>
                <Toggle checked={activeStatus} onChange={() => setActiveStatus(!activeStatus)} />
              </div>

              <div style={styles.privacyDivider} />

              <div style={styles.privacyItem}>
                <div>
                  <div style={styles.privacyItemTitle}>Public Profile</div>
                  <div style={styles.privacyItemDesc}>Allow non-followers to see content</div>
                </div>
                <Toggle checked={publicProfile} onChange={() => setPublicProfile(!publicProfile)} />
              </div>

              <div style={styles.privacyDivider} />

              <div style={styles.privacyItem}>
                <div>
                  <div style={styles.privacyItemTitle}>Two-Factor Auth</div>
                  <div style={styles.privacyItemDesc}>Highly recommended for security</div>
                </div>
                <button style={styles.enableBtn}>ENABLE</button>
              </div>
            </div>

            {/* Account Health */}
            <div style={{ ...styles.card, flex: 1 }}>
              <div style={styles.healthHeader}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1a2e" }}>Account Health</h3>
                <span style={styles.optimizedBadge}>OPTIMIZED</span>
              </div>

              <div style={styles.healthGrid}>
                <div style={styles.healthItem}>
                  <div style={styles.healthLabel}>STORAGE</div>
                  <div style={styles.healthValue}>12.4 GB</div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: "62%" }} />
                  </div>
                </div>
                <div style={styles.healthItem}>
                  <div style={styles.healthLabel}>SECURITY</div>
                  <div style={styles.healthValueBold}>Level 4</div>
                  <div style={styles.healthNote}>Update password to reach L5</div>
                </div>
                <div style={styles.healthItem}>
                  <div style={styles.healthLabel}>SESSIONS</div>
                  <div style={styles.healthValueBold}>3 Active</div>
                  <button style={styles.viewAllBtn}>VIEW ALL</button>
                </div>
              </div>

              <div style={styles.healthActions}>
                <button
                  style={{
                    ...styles.downloadBtn,
                    ...(hoveredBtn === "download" ? { backgroundColor: "#f0f4ff" } : {}),
                  }}
                  onMouseEnter={() => setHoveredBtn("download")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  Download My Data
                </button>
                <button
                  style={{
                    ...styles.deleteBtn,
                    ...(hoveredBtn === "delete" ? { backgroundColor: "#ffe0e0" } : {}),
                  }}
                  onMouseEnter={() => setHoveredBtn("delete")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Help Banner */}
          <div style={styles.helpBanner}>
            <div>
              <h3 style={styles.helpTitle}>Need some assistance?</h3>
              <p style={styles.helpSubtitle}>Our support team is available 24/7 to help with your account security and settings.</p>
            </div>
            <button
              style={{
                ...styles.helpBtn,
                ...(hoveredBtn === "help" ? { backgroundColor: "#1a3a80" } : {}),
              }}
              onMouseEnter={() => setHoveredBtn("help")}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Visit Help Center
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f8",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif",
  },

  // Navbar
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: "0 32px",
    height: "60px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1a1a2e",
    letterSpacing: "-0.3px",
  },
  navLinks: {
    display: "flex",
    gap: "32px",
  },
  navLink: {
    textDecoration: "none",
    color: "#555",
    fontSize: "15px",
    fontWeight: "500",
  },
  navLinkActive: {
    color: "#2f6aff",
    fontWeight: "600",
  },
  navIcons: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    borderRadius: "8px",
  },
  avatarCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#2f6aff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  // Layout
  mainLayout: {
    display: "flex",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
    gap: "28px",
    alignItems: "flex-start",
  },

  // Sidebar
  sidebar: {
    width: "220px",
    flexShrink: 0,
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "24px 16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    position: "sticky",
    top: "80px",
  },
  sidebarHeader: {
    marginBottom: "20px",
    paddingLeft: "8px",
  },
  sidebarTitle: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  sidebarSubtitle: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
  },
  sideNav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginBottom: "24px",
  },
  sideNavItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
    textAlign: "left",
    transition: "background-color 0.15s",
  },
  sideNavItemActive: {
    backgroundColor: "#eef2ff",
    color: "#2f6aff",
    fontWeight: "600",
    borderLeft: "3px solid #2f6aff",
    paddingLeft: "9px",
  },
  saveBtn: {
    marginTop: "auto",
    padding: "12px",
    backgroundColor: "#2f6aff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },

  // Content
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: 0,
  },
  contentHeader: {
    marginBottom: "4px",
  },
  contentTitle: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: "-0.5px",
  },
  contentSubtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  cardSubtitle: {
    margin: "0 0 20px 0",
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  // Profile
  profileRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
  },
  avatarWrapper: {
    position: "relative",
    flexShrink: 0,
  },
  avatarLarge: {
    width: "90px",
    height: "90px",
    borderRadius: "12px",
    backgroundColor: "#dde3f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#2f6aff",
    border: "2px solid #fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px 16px",
    flex: 1,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fieldLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9ca3af",
    letterSpacing: "0.5px",
  },
  fieldInput: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    color: "#1a1a2e",
    backgroundColor: "#f9fafb",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  // Theme
  themeRow: {
    display: "flex",
    gap: "12px",
  },
  themeBtn: {
    flex: 1,
    padding: "16px 8px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    transition: "border-color 0.2s",
  },
  themeBtnActive: {
    borderColor: "#2f6aff",
    backgroundColor: "#f0f4ff",
  },

  // Privacy
  privacyHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  privacyIconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  privacyItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
  },
  privacyDivider: {
    height: "1px",
    backgroundColor: "#f3f4f6",
  },
  privacyItemTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "3px",
  },
  privacyItemDesc: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  enableBtn: {
    background: "none",
    border: "none",
    color: "#2f6aff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.3px",
  },

  // Account Health
  healthHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  optimizedBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#16a34a",
    letterSpacing: "0.5px",
  },
  healthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },
  healthItem: {
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    padding: "14px 12px",
  },
  healthLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },
  healthValue: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  healthValueBold: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "6px",
  },
  healthNote: {
    fontSize: "11px",
    color: "#9ca3af",
    lineHeight: "1.4",
  },
  progressBar: {
    height: "4px",
    backgroundColor: "#e5e7eb",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2f6aff",
    borderRadius: "2px",
  },
  viewAllBtn: {
    background: "none",
    border: "none",
    color: "#2f6aff",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
    letterSpacing: "0.3px",
  },
  healthActions: {
    display: "flex",
    gap: "12px",
  },
  downloadBtn: {
    flex: 1,
    padding: "11px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a2e",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  deleteBtn: {
    flex: 1,
    padding: "11px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    backgroundColor: "#fff5f5",
    fontSize: "13px",
    fontWeight: "600",
    color: "#dc2626",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },

  // Help Banner
  helpBanner: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "24px 28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  helpTitle: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  helpSubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
  helpBtn: {
    padding: "12px 24px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
  },
};

export default Settings;
