import React, { useState, useEffect } from 'react';
import { styles } from './guests/styles';
import StatsCard from './guests/StatsCard';
import GuestList from './guests/GuestList';
import TableList from './guests/TableList';
import GuestModal from './guests/GuestModal';
import TableModal from './guests/TableModal';
import TableDetailsModal from './guests/TableDetailsModal';

function GuestsPage({ user, members }) {
  const [activeTab, setActiveTab] = useState('guests'); // 'guests' or 'tables'
  const [guests, setGuests] = useState([]);
  const [tables, setTables] = useState([]);
  const [maxGuests, setMaxGuests] = useState(0);
  const [editingMaxGuests, setEditingMaxGuests] = useState(null);
  
  // Modals
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [selectedTableForAssignment, setSelectedTableForAssignment] = useState(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  

  // Form States
  const [editingGuest, setEditingGuest] = useState(null); // If null -> Add mode, else -> Edit mode
  const [guestForm, setGuestForm] = useState({ 
      first_name: '', 
      last_name: '', 
      side: 'Wedding', 
      table_id: '', 
      is_confirmed: 'Pending' 
  });
  const [newTable, setNewTable] = useState({ name: '', capacity: 10 });
  const [editingTable, setEditingTable] = useState(null); // For editing table name
  const [tableForm, setTableForm] = useState({ name: '', capacity: 10 });
  const [editingField, setEditingField] = useState(null); // 'name' or 'capacity'

  useEffect(() => {
    if (user?.wedding_id) {
        fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Poll wedding settings so multiple admins see updated max_guests
  useEffect(() => {
    if (!user?.wedding_id) return;
    let mounted = true;

    const pollSettings = async () => {
      try {
        const res = await fetch(`/wedding/${user.wedding_id}/settings`);
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          const newVal = json?.max_guests ?? 0;
          // Update state; React ignores identical values so this is safe
          setMaxGuests(newVal);
          setEditingMaxGuests(newVal);
        }
      } catch (e) {
        console.error('poll settings', e);
      }
    };

    // initial poll + interval
    pollSettings();
    const id = setInterval(pollSettings, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, [user?.wedding_id]);

  const fetchData = async () => {
    if (!user?.wedding_id) return;
    try {
      const resGuests = await fetch(`/wedding/${user.wedding_id}/guests`);
      const resTables = await fetch(`/wedding/${user.wedding_id}/tables`);
      const guestsJson = await resGuests.json();
      const tablesJson = await resTables.json();
      setGuests(guestsJson);
      setTables(tablesJson);

      // fetch settings (max guests)
      try {
        const resSettings = await fetch(`/wedding/${user.wedding_id}/settings`);
        if (resSettings.ok) {
          const json = await resSettings.json();
          setMaxGuests(json.max_guests || 0);
          setEditingMaxGuests(json.max_guests || 0);
        }
      } catch (e) { console.error('settings fetch', e); }
    } catch (err) { console.error(err); }
  };

  // --- Guest Actions ---
  const openGuestModal = (guest = null) => {
      if (guest) {
          setEditingGuest(guest);
          setGuestForm({
              first_name: guest.first_name,
              last_name: guest.last_name,
              side: guest.side,
              table_id: guest.table_id || '',
              is_confirmed: guest.is_confirmed
          });
      } else {
          setEditingGuest(null);
          setGuestForm({ 
              first_name: '', 
              last_name: '', 
              side: 'Wedding', 
              table_id: '', 
              is_confirmed: 'Pending' 
          });
      }
      setShowGuestModal(true);
  };

  const handleSaveGuest = async () => {
    const method = editingGuest ? 'PUT' : 'POST';
    const url = editingGuest 
        ? `http://localhost:5001/guests/${editingGuest.id}`
        : 'http://localhost:5001/guests';
    
    const body = { ...guestForm, wedding_id: user.wedding_id };
    // Convert empty string table_id to null
    if (body.table_id === '') body.table_id = null;

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setShowGuestModal(false);
    fetchData();
  };

  const handleDeleteGuest = async (id) => {
    if (!window.confirm("Delete guest?")) return;
    await fetch(`/guests/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // --- Table Actions ---
  const handleAddTable = async () => {
    await fetch('/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTable, wedding_id: user.wedding_id })
    });
    setShowTableModal(false);
    setNewTable({ name: '', capacity: 10 });
    fetchData();
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm("Delete table?")) return;
    await fetch(`/tables/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const saveMaxGuests = async () => {
    if (!user || user.role !== 'admin') return;
    await fetch(`/wedding/${user.wedding_id}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_guests: Number(editingMaxGuests) || 0 })
    });
    setMaxGuests(Number(editingMaxGuests) || 0);
    fetchData();
  };

  const handleRemoveGuestFromTable = async (guestId) => {
      await fetch(`/guests/${guestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table_id: null })
      });
      fetchData();
  };

  const handleSaveTable = async (field) => {
    if (!selectedTable) return;
    const updatedData = {
        name: field === 'name' ? tableForm.name : selectedTable.name,
        capacity: field === 'capacity' ? tableForm.capacity : selectedTable.capacity
    };

    await fetch(`/tables/${selectedTable.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setEditingField(null);
    // Update local state immediately for better UX
    setSelectedTable(prev => ({ ...prev, ...updatedData }));
    fetchData();
  };

  const handleAssignGuestToTable = async (guestId) => {
    if (!selectedTableForAssignment) return;
    await fetch(`/guests/${guestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table_id: selectedTableForAssignment })
    });
    // Don't close the selector
    fetchData();
  };

  // --- Render Helpers ---

  const toggleSort = (col) => {
    if (sortColumn === col) setSortAsc(!sortAsc);
    else { setSortColumn(col); setSortAsc(true); }
  };

  const sortedGuests = (() => {
    let filtered = guests;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = guests.filter(g => 
        (g.first_name || '').toLowerCase().includes(lowerQ) || 
        (g.last_name || '').toLowerCase().includes(lowerQ)
      );
    }

    if (!sortColumn) return filtered;
    const copy = [...filtered];
    copy.sort((a,b) => {
      let va = a[sortColumn];
      let vb = b[sortColumn];
      // special handling for table -> compare table names
      if (sortColumn === 'table') {
        va = tables.find(t => t.id === a.table_id)?.name || '';
        vb = tables.find(t => t.id === b.table_id)?.name || '';
      }
      va = (va === null || va === undefined) ? '' : String(va).toLowerCase();
      vb = (vb === null || vb === undefined) ? '' : String(vb).toLowerCase();
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
    return copy;
  })();

  // Admins for "From" dropdown
  const admins = members ? members.filter(m => m.role === 'admin' || m.role === 'Admin') : [];

  // counts
  const totalRegistered = guests.length;
  const confirmed = guests.filter(g => g.is_confirmed === 'Yes').length;
  const notComing = guests.filter(g => g.is_confirmed === 'No').length;

  return (
    <div style={styles.container}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={styles.pageTitle}>GUESTS & TABLES</h2>
        <StatsCard 
            confirmed={confirmed}
            totalRegistered={totalRegistered}
            notComing={notComing}
            maxGuests={maxGuests}
            user={user}
            editingMaxGuests={editingMaxGuests}
            setEditingMaxGuests={setEditingMaxGuests}
            saveMaxGuests={saveMaxGuests}
        />
      </div>

      <div style={styles.toggleContainer}>
        <button 
            style={activeTab === 'guests' ? styles.toggleBtnActive : styles.toggleBtn}
            onClick={() => setActiveTab('guests')}
        >
            GUESTS
        </button>
        <button 
            style={activeTab === 'tables' ? styles.toggleBtnActive : styles.toggleBtn}
            onClick={() => setActiveTab('tables')}
        >
            TABLES
        </button>
      </div>

      {activeTab === 'guests' ? (
        <GuestList 
            guests={sortedGuests}
            tables={tables}
            openGuestModal={openGuestModal}
            handleDeleteGuest={handleDeleteGuest}
            sortColumn={sortColumn}
            sortAsc={sortAsc}
            toggleSort={toggleSort}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowTableModal={setShowTableModal}
        />
      ) : (
        <TableList 
            tables={tables}
            guests={guests}
            openGuestModal={openGuestModal}
            setShowTableModal={setShowTableModal}
            setSelectedTable={setSelectedTable}
            handleDeleteTable={handleDeleteTable}
        />
      )}

      <GuestModal 
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        editingGuest={editingGuest}
        guestForm={guestForm}
        setGuestForm={setGuestForm}
        handleSaveGuest={handleSaveGuest}
        admins={admins}
        tables={tables}
        guests={guests}
      />

      <TableModal 
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        newTable={newTable}
        setNewTable={setNewTable}
        handleAddTable={handleAddTable}
      />

      <TableDetailsModal 
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        editingTable={editingTable}
        setEditingTable={setEditingTable}
        tableForm={tableForm}
        setTableForm={setTableForm}
        editingField={editingField}
        setEditingField={setEditingField}
        handleSaveTable={handleSaveTable}
        guests={guests}
        handleRemoveGuestFromTable={handleRemoveGuestFromTable}
        showGuestSelector={showGuestSelector}
        setShowGuestSelector={setShowGuestSelector}
        selectedTableForAssignment={selectedTableForAssignment}
        setSelectedTableForAssignment={setSelectedTableForAssignment}
        handleAssignGuestToTable={handleAssignGuestToTable}
        tables={tables}
      />

    </div>
  );
}

export default GuestsPage;
