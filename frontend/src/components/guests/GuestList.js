import React from 'react';
import { styles } from './styles';

function GuestList({ 
  guests, 
  tables, 
  openGuestModal, 
  handleDeleteGuest, 
  sortColumn, 
  sortAsc, 
  toggleSort, 
  searchQuery, 
  setSearchQuery,
  setShowTableModal 
}) {
  return (
    <div style={styles.tabContent}>
      <div style={styles.actionArea}>
        <div style={styles.addButtonContainer}>
            <span style={styles.addLabel}>Add guest</span>
            <button style={styles.plusButton} onClick={() => openGuestModal()}>+</button>
        </div>
        <div style={styles.addButtonContainer}>
            <span style={styles.addLabel}>Add Table</span>
            <button style={styles.plusButtonBrown} onClick={() => setShowTableModal(true)}>+</button>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={{marginBottom: '15px'}}>
            <input 
                type="text" 
                placeholder="Search guest..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                }}
            />
        </div>
        <div style={styles.tableHeaderRow}>
          <div style={{...styles.col, flex: 1, cursor: 'pointer'}} onClick={() => toggleSort('first_name')}>FIRST NAME {sortColumn==='first_name'?(sortAsc?'▲':'▼'):''}</div>
          <div style={{...styles.col, flex: 1, cursor: 'pointer'}} onClick={() => toggleSort('last_name')}>LAST NAME {sortColumn==='last_name'?(sortAsc?'▲':'▼'):''}</div>
          <div style={{...styles.col, flex: 1, cursor: 'pointer'}} onClick={() => toggleSort('is_confirmed')}>CONFIRM {sortColumn==='is_confirmed'?(sortAsc?'▲':'▼'):''}</div>
          <div style={{...styles.col, flex: 1, cursor: 'pointer'}} onClick={() => toggleSort('table')}>TABLE {sortColumn==='table'?(sortAsc?'▲':'▼'):''}</div>
          <div style={{...styles.col, flex: 1, cursor: 'pointer'}} onClick={() => toggleSort('side')}>FROM {sortColumn==='side'?(sortAsc?'▲':'▼'):''}</div>
          <div style={{width: 30}}></div>
        </div>
        {guests.map(g => (
          <div key={g.id} style={styles.tableRow} onClick={() => openGuestModal(g)}>
            <div style={{...styles.col, flex: 1}}>{g.first_name}</div>
            <div style={{...styles.col, flex: 1}}>{g.last_name}</div>
            <div style={{...styles.col, flex: 1}}>{g.is_confirmed}</div>
            <div style={{...styles.col, flex: 1}}>
                {tables.find(t => t.id === g.table_id)?.name || '-'}
            </div>
            <div style={{...styles.col, flex: 1}}>{g.side}</div>
            <div style={{width: 30, cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); handleDeleteGuest(g.id); }}>🗑️</div>
          </div>
        ))}
        {guests.length === 0 && <div style={{padding: 20, textAlign: 'center', color: '#888'}}>No guests yet</div>}
      </div>
    </div>
  );
}

export default GuestList;
