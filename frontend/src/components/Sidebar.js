import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'guests', label: 'Guests', icon: '👥' },
    { id: 'vendors', label: 'Vendors', icon: '🏪' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'budget', label: 'Budget', icon: '💰' },
  ];

  return (
    <div style={styles.sidebar}>
      {menuItems.map((item) => (
        <div
          key={item.id}
          style={{
            ...styles.menuItem,
            backgroundColor: activeTab === item.id ? '#e8e4d9' : 'transparent',
            fontWeight: activeTab === item.id ? '600' : '400',
          }}
          onClick={() => setActiveTab(item.id)}
        >
          <span style={styles.icon}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  sidebar: {
    width: '180px',
    backgroundColor: '#f5f3eb',
    padding: '20px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    borderRight: '1px solid #e0ddd3',
    minHeight: '100vh',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#4a4a4a',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  icon: {
    fontSize: '16px',
  },
};

export default Sidebar;
