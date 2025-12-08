import React from 'react';
import { styles } from './styles';

function StatsCard({ confirmed, totalRegistered, notComing, maxGuests, user, editingMaxGuests, setEditingMaxGuests, saveMaxGuests }) {
  return (
    <div style={styles.statsCard}>
      <div>Confirmed: <strong>{confirmed}</strong></div>
      <div>Registered: <strong>{totalRegistered}</strong></div>
      <div>Not coming: <strong>{notComing}</strong></div>
      <div>Max (admins): <strong>{maxGuests}</strong></div>
      {user?.role === 'admin' && (
        <div style={{marginTop:8, display:'flex', gap:8, alignItems:'center'}}>
          <input type="number" value={editingMaxGuests ?? ''} onChange={e => setEditingMaxGuests(e.target.value)} style={styles.smallInput} />
          <button style={styles.smallSaveBtn} onClick={saveMaxGuests}>Save</button>
        </div>
      )}
    </div>
  );
}

export default StatsCard;
