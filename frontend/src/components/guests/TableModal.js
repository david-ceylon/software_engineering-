import React from 'react';
import { styles } from './styles';

function TableModal({ isOpen, onClose, newTable, setNewTable, handleAddTable }) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <h3>Add Table</h3>
            <input 
                style={styles.input} 
                placeholder="Table Name (e.g. Table 1)" 
                value={newTable.name} 
                onChange={e => setNewTable({...newTable, name: e.target.value})}
            />
            <input 
                style={styles.input} 
                type="number"
                placeholder="Capacity" 
                value={newTable.capacity} 
                onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
            />
            <div style={styles.modalActions}>
                <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleAddTable}>Add</button>
            </div>
        </div>
    </div>
  );
}

export default TableModal;
