import React from 'react';
import { styles } from './styles';

function TableDetailsModal({ 
  selectedTable, 
  setSelectedTable, 
  editingTable, 
  setEditingTable, 
  tableForm, 
  setTableForm, 
  editingField, 
  setEditingField, 
  handleSaveTable, 
  guests, 
  handleRemoveGuestFromTable, 
  showGuestSelector, 
  setShowGuestSelector, 
  selectedTableForAssignment, 
  setSelectedTableForAssignment, 
  handleAssignGuestToTable, 
  tables 
}) {
  if (!selectedTable) return null;

  return (
    <div style={{...styles.modalOverlay, gap: '20px'}}>
        <div style={styles.modalContent}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              {editingField === 'name' ? (
                <input 
                  autoFocus
                  style={{...styles.input, fontSize: '1.2rem', fontWeight: 'bold'}}
                  value={tableForm.name}
                  onChange={e => setTableForm({...tableForm, name: e.target.value})}
                  onBlur={() => handleSaveTable('name')}
                  onKeyDown={e => e.key === 'Enter' && handleSaveTable('name')}
                  placeholder="Table Name"
                />
              ) : (
                <h3 
                  style={{margin:0, cursor: 'pointer', borderBottom: '1px dashed #ccc'}} 
                  onClick={() => {
                      setEditingField('name');
                      setTableForm({ ...tableForm, name: selectedTable.name });
                  }}
                  title="Click to edit name"
                >
                  {selectedTable.name}
                </h3>
              )}
              <button onClick={() => { setSelectedTable(null); setEditingTable(null); setShowGuestSelector(false); }} style={styles.closeX}>×</button>
            </div>
            <div style={{margin:'5px 0 15px'}}>
              {editingField === 'capacity' ? (
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <label style={styles.label}>Capacity:</label>
                  <input 
                    autoFocus
                    type="number"
                    style={{...styles.input, width: '80px'}}
                    value={tableForm.capacity}
                    onChange={e => setTableForm({...tableForm, capacity: parseInt(e.target.value) || 10})}
                    onBlur={() => handleSaveTable('capacity')}
                    onKeyDown={e => e.key === 'Enter' && handleSaveTable('capacity')}
                  />
                </div>
              ) : (
                <p 
                  style={{color:'#666', margin:0, cursor: 'pointer', display: 'inline-block', borderBottom: '1px dashed #ccc'}}
                  onClick={() => {
                      setEditingField('capacity');
                      setTableForm({ ...tableForm, capacity: selectedTable.capacity });
                  }}
                  title="Click to edit capacity"
                >
                  Capacity: {selectedTable.capacity}
                </p>
              )}
            </div>
            
            <div style={styles.guestListScroll}>
              {guests.filter(g => g.table_id === selectedTable.id).map(g => (
                  <div key={g.id} style={styles.guestRow}>
                      <span>{g.first_name} {g.last_name}</span>
                      <button 
                          style={styles.removeBtn}
                          onClick={() => handleRemoveGuestFromTable(g.id)}
                          title="Remove from table"
                      >
                          -
                      </button>
                  </div>
              ))}
              {guests.filter(g => g.table_id === selectedTable.id).length === 0 && (
                  <p style={{fontStyle:'italic', color:'#999'}}>No guests at this table</p>
              )}
            </div>

            <div style={{marginTop: '15px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
              <button 
                style={styles.addGuestToTableBtn}
                onClick={() => {
                  if (showGuestSelector) {
                      setShowGuestSelector(false);
                  } else {
                      setShowGuestSelector(true);
                      setSelectedTableForAssignment(selectedTable.id);
                  }
                }}
              >
                  + Add Guest
              </button>
            </div>
        </div>

        {showGuestSelector && selectedTableForAssignment === selectedTable.id && (
          <div style={styles.modalContent}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                <h4 style={{margin: 0}}>Select Guest to Assign</h4>
                <button onClick={() => { setShowGuestSelector(false); setSelectedTableForAssignment(null); }} style={styles.closeX}>×</button>
            </div>
            <div style={{flex: 1, overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px'}}>
              {[...guests].filter(guest => guest.table_id !== selectedTableForAssignment).sort((a, b) => {
                if (!a.table_id && !b.table_id) return a.first_name.localeCompare(b.first_name) || a.last_name.localeCompare(b.last_name);
                if (!a.table_id) return -1;
                if (!b.table_id) return 1;
                const tableA = tables.find(t => t.id === a.table_id)?.name || '';
                const tableB = tables.find(t => t.id === b.table_id)?.name || '';
                return tableA.localeCompare(tableB) || a.first_name.localeCompare(b.first_name) || a.last_name.localeCompare(b.last_name);
              }).map(guest => {
                const currentTable = tables.find(t => t.id === guest.table_id);
                return (
                  <div key={guest.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', padding: '5px', backgroundColor: '#f9f9f9'}}>
                    <span>{guest.first_name} {guest.last_name} - {currentTable ? `Table: ${currentTable.name}` : 'Unassigned'}</span>
                    <button 
                      style={styles.assignBtn}
                      onClick={() => handleAssignGuestToTable(guest.id)}
                    >
                      Assign
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => { setShowGuestSelector(false); setSelectedTableForAssignment(null); }}
                >
                  Close
                </button>
            </div>
          </div>
        )}
    </div>
  );
}

export default TableDetailsModal;
