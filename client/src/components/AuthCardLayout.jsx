const AuthCardLayout = ({ title, subtitle, styles, children }) => {
  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCardLayout;
