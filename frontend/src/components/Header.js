import React from 'react';

function Header({ user, weddingTitle, onLogout, onProfileClick }) {
  return (
    <div style={styles.header}>
      <h1 style={styles.title}>{weddingTitle || "Sarah & David Wedding"}</h1>
      <div style={styles.rightSection}>
        <span style={styles.greeting}>Hello {user?.name || 'User'}</span>
        <button style={styles.link} onClick={onProfileClick}>Profile</button>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#f5f3eb',
    borderBottom: '1px solid #e0ddd3',
  },
  title: {
    fontFamily: "'Georgia', serif",
    fontStyle: 'italic',
    fontSize: '24px',
    fontWeight: '400',
    color: '#4a4a4a',
    margin: 0,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  greeting: {
    color: '#6b6b6b',
    fontSize: '14px',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#6b6b6b',
    fontSize: '14px',
    cursor: 'pointer',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#6b6b6b',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default Header;
