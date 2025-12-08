import React from 'react';
import { styles } from './styles';

function TableList({ tables, guests, openGuestModal, setShowTableModal, setSelectedTable, handleDeleteTable }) {
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

      <div style={styles.tablesGrid}>
        {tables.map(t => {
            const tableGuests = guests.filter(g => g.table_id === t.id);
            return (
                <div key={t.id} style={styles.seatCard} onClick={() => setSelectedTable(t)}>
                    <div style={styles.seatHeader}>
                        <span style={styles.seatTitle}>{t.name}</span>
                        <span style={styles.seatCount}>{tableGuests.length}/{t.capacity}</span>
                    </div>
                    <div style={styles.seatList}>
                        {tableGuests.map(g => (
                            <div key={g.id} style={styles.seatItem}>
                                - {g.first_name} {g.last_name}
                            </div>
                        ))}
                        {tableGuests.length === 0 && <div style={{color: '#aaa', fontStyle: 'italic'}}>Empty</div>}
                    </div>
                    <button 
                        style={styles.deleteTableBtn} 
                        onClick={(e) => { e.stopPropagation(); handleDeleteTable(t.id); }}
                    >
                        Delete
                    </button>
                </div>
            );
        })}
      </div>
    </div>
  );
}

export default TableList;
