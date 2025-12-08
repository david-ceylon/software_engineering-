import React from 'react';
import { styles } from './styles';

function GuestModal({ isOpen, onClose, editingGuest, guestForm, setGuestForm, handleSaveGuest, admins, tables, guests }) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <h3>{editingGuest ? 'Modify Guest' : 'Add Guest'}</h3>
            
            <label style={styles.label}>First Name</label>
            <input 
                style={styles.input} 
                value={guestForm.first_name} 
                onChange={e => setGuestForm({...guestForm, first_name: e.target.value})}
            />
            
            <label style={styles.label}>Last Name</label>
            <input 
                style={styles.input} 
                value={guestForm.last_name} 
                onChange={e => setGuestForm({...guestForm, last_name: e.target.value})}
            />
            
            <label style={styles.label}>From</label>
            <select 
                style={styles.input} 
                value={guestForm.side} 
                onChange={e => setGuestForm({...guestForm, side: e.target.value})}
            >
                <option value="Wedding">From Wedding</option>
                {admins.map(admin => (
                    <option key={admin.id} value={admin.name}>From {admin.name}</option>
                ))}
            </select>

            <label style={styles.label}>Table</label>
            <select 
                style={styles.input} 
                value={guestForm.table_id} 
                onChange={e => setGuestForm({...guestForm, table_id: e.target.value})}
            >
                <option value="">No Table</option>
                {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({guests.filter(g => g.table_id === t.id).length}/{t.capacity})</option>
                ))}
            </select>

            <label style={styles.label}>Status</label>
            <select 
                style={styles.input} 
                value={guestForm.is_confirmed} 
                onChange={e => setGuestForm({...guestForm, is_confirmed: e.target.value})}
            >
                <option value="Pending">Pending</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe</option>
            </select>

            <div style={styles.modalActions}>
                <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleSaveGuest}>{editingGuest ? 'Save' : 'Add'}</button>
            </div>
        </div>
    </div>
  );
}

export default GuestModal;
