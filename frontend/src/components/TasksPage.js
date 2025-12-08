import React, { useState, useEffect } from 'react';

function TaskModal({ task, onClose, onUpdate, onDelete, members, user, readOnly, onToggleStatus }) {
  const [editedTask, setEditedTask] = useState({ ...task });
  const isNew = !task.id;

  const handleSave = () => {
    if (readOnly) return onClose();
    onUpdate(editedTask);
    onClose();
  };

  const handleDelete = () => {
    if (readOnly) return;
    // delegate deletion to parent (parent will open confirm)
    onDelete(task);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={{margin: 0}}>{isNew ? 'Create A New Task' : 'Task Details'}</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        
        <div style={styles.modalBody}>
          <label style={styles.label}>Title</label>
          {readOnly ? (
            <div style={styles.readOnlyField}>{editedTask.title}</div>
          ) : (
            <input 
              type="text" 
              value={editedTask.title} 
              onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              style={styles.input}
            />
          )}

          <label style={styles.label}>Description</label>
          {readOnly ? (
            <div style={styles.readOnlyArea}>{editedTask.description || 'No description'}</div>
          ) : (
            <textarea 
              value={editedTask.description || ''} 
              onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
              style={styles.textarea}
              rows={4}
              placeholder="Add a description..."
            />
          )}

          <div style={styles.row}>
            <div style={{flex: 1}}>
              <label style={styles.label}>Due Date</label>
              {readOnly ? (
                <div style={styles.readOnlyField}>{editedTask.due_date || '-'}</div>
              ) : (
                <input 
                  type="date" 
                  value={editedTask.due_date || ''} 
                  onChange={(e) => setEditedTask({...editedTask, due_date: e.target.value})}
                  style={styles.input}
                />
              )}
            </div>
            <div style={{flex: 1, marginLeft: '15px'}}>
              <label style={styles.label}>Assigned To</label>
              {readOnly ? (
                <div style={styles.readOnlyField}>
                  {members.find(m => m.id == editedTask.assigned_to)?.name || 'Unassigned'}
                </div>
              ) : (
                <select 
                  value={editedTask.assigned_to || ''} 
                  onChange={(e) => setEditedTask({...editedTask, assigned_to: e.target.value})}
                  style={styles.select}
                >
                  <option value="">Unassigned</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.id === user.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          {!readOnly && !isNew && <button onClick={handleDelete} style={styles.deleteButton}>Delete</button>}

          {readOnly ? (
            <>
              <button onClick={handleSave} style={styles.closeFooterButton}>{'Close'}</button>
              {onToggleStatus && task.assigned_to == user.id && (
                <button
                  onClick={() => { onToggleStatus(task); onClose(); }}
                  style={{ ...styles.saveButton, backgroundColor: '#4CAF50' }}
                >
                  Valider
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={handleSave} style={styles.saveButton}>{isNew ? 'Create' : 'Save Changes'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ task, onCancel, onConfirm }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // trigger CSS-like entrance animation
    const t = setTimeout(() => setEntered(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      ...styles.modalOverlay,
      backgroundColor: 'rgba(0,0,0,0.45)',
    }}>
      <div style={{
        ...styles.confirmContent,
        transform: entered ? 'scale(1)' : 'scale(0.96)',
        opacity: entered ? 1 : 0,
      }}>
        <h3 style={{marginTop:0}}>Confirm deletion</h3>
        <p>Voulez-vous vraiment supprimer la tâche <strong>{task?.title}</strong> ?</p>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
          <button onClick={onCancel} style={styles.cancelButton}>Annuler</button>
          <button onClick={onConfirm} style={styles.deleteSmallButton}>🗑️ Supprimer</button>
        </div>
      </div>
    </div>
  );
}

function TasksPage({ tasks, members, onAddTask, onUpdateTask, onDeleteTask, onToggleStatus, user, weddingTitle }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmTask, setConfirmTask] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const isCollaborator = user?.role === 'collaborator';

  const handleAddTaskClick = () => {
    setSelectedTask({
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
      assigned_to: user.id,
      status: 'To Do'
    });
  };

  const handleSaveTask = (task) => {
    if (task.id) {
      onUpdateTask(task);
    } else {
      onAddTask(task);
    }
    setSelectedTask(null);
  };

  const toggleSort = (col) => {
    if (sortColumn === col) setSortAsc(!sortAsc);
    else { setSortColumn(col); setSortAsc(true); }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // default behavior when no column selected: keep Done at bottom
    if (!sortColumn) {
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      if (a.status !== 'Done' && b.status === 'Done') return -1;
      return 0;
    }

    // special handling for status sorting: Done top/bottom depending on arrow
    if (sortColumn === 'status') {
      const doneA = a.status === 'Done';
      const doneB = b.status === 'Done';
      if (doneA === doneB) return 0;
      // asc: Done at top; desc: Done at bottom
      return sortAsc ? (doneA ? -1 : 1) : (doneA ? 1 : -1);
    }

    const getVal = (t) => {
      if (sortColumn === 'title') return (t.title || '').toLowerCase();
      if (sortColumn === 'description') return (t.description || '').toLowerCase();
      if (sortColumn === 'assigned') {
        return (members.find(m => m.id == t.assigned_to)?.name || 'zzzz').toLowerCase();
      }
      if (sortColumn === 'due_date') return t.due_date || '';
      return '';
    };

    const va = getVal(a);
    const vb = getVal(b);

    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;

    // keep Done at bottom when values tie and no explicit status sort
    if (a.status === 'Done' && b.status !== 'Done') return 1;
    if (a.status !== 'Done' && b.status === 'Done') return -1;
    return 0;
  });

  return (
    <div style={styles.container}>
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onUpdate={handleSaveTask}
          onDelete={(taskToDelete) => setConfirmTask(taskToDelete)}
          members={members}
          user={user}
          readOnly={isCollaborator}
          onToggleStatus={onToggleStatus}
        />
      )}

      {confirmTask && !isCollaborator && (
        <ConfirmModal
          task={confirmTask}
          onCancel={() => setConfirmTask(null)}
          onConfirm={() => {
            onDeleteTask(confirmTask.id);
            // close modal if the same task is open
            if (selectedTask && selectedTask.id === confirmTask.id) setSelectedTask(null);
            setConfirmTask(null);
          }}
        />
      )}

      <div style={styles.header}>
        <h2 style={styles.title}>{weddingTitle || "Sarah & David Wedding"}</h2>
        {!isCollaborator && <button style={styles.addButton} onClick={handleAddTaskClick}>Add task</button>}
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div 
            style={{ ...styles.headerCell, width: '50px', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => toggleSort('status')}
          >
            Done {sortColumn === 'status' ? (sortAsc ? '▲' : '▼') : ''}
          </div>
          <div 
            style={{ ...styles.headerCell, flex: 2, cursor: 'pointer' }}
            onClick={() => toggleSort('title')}
          >
            TASKS {sortColumn === 'title' ? (sortAsc ? '▲' : '▼') : ''}
          </div>
          <div 
            style={{ ...styles.headerCell, flex: 1.5, cursor: 'pointer' }}
            onClick={() => toggleSort('description')}
          >
            Description {sortColumn === 'description' ? (sortAsc ? '▲' : '▼') : ''}
          </div>
          <div 
            style={{ ...styles.headerCell, flex: 1, cursor: 'pointer' }}
            onClick={() => toggleSort('assigned')}
          >
            Assigned to {sortColumn === 'assigned' ? (sortAsc ? '▲' : '▼') : ''}
          </div>
          <div 
            style={{ ...styles.headerCell, width: '150px', cursor: 'pointer' }}
            onClick={() => toggleSort('due_date')}
          >
            Due Date {sortColumn === 'due_date' ? (sortAsc ? '▲' : '▼') : ''}
          </div>
          <div style={{ ...styles.headerCell, width: '100px' }}></div>
        </div>

        <div style={styles.taskList}>
          {sortedTasks.map((task) => (
            <div key={task.id} style={styles.taskRow}>
              {/* Checkbox Column */}
              <div style={{ ...styles.cell, width: '50px', justifyContent: 'center' }}>
                <input 
                  type="checkbox"
                  checked={task.status === 'Done'}
                  onChange={() => onToggleStatus && onToggleStatus(task)}
                  style={styles.checkbox}
                  disabled={isCollaborator && task.assigned_to != user.id}
                />
              </div>

              {/* Task Description Column */}
              <div style={{ ...styles.cell, flex: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={styles.taskTitleContainer}>
                  <span 
                    style={{
                      ...styles.taskTitle,
                      textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                      color: task.status === 'Done' ? '#888' : '#333',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTask(task)}
                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.target.style.textDecoration = task.status === 'Done' ? 'line-through' : 'none'}
                  >
                    {task.title}
                  </span>
                </div>
              </div>

              {/* Description Column */}
              <div style={{ ...styles.cell, flex: 1.5 }}>
                <span style={styles.descriptionText}>{task.description || ''}</span>
              </div>

              {/* Assigned To Column */}
              <div style={{ ...styles.cell, flex: 1 }}>
                <span style={styles.assignedText}>
                   {members.find(m => m.id == task.assigned_to)?.name || 'Unassigned'}
                </span>
              </div>

              {/* Due Date Column */}
              <div style={{ ...styles.cell, width: '150px' }}>
                <span style={styles.dateText}>{task.due_date}</span>
              </div>

              {/* Delete Action (right) */}
              {!isCollaborator && (
                <div style={{ ...styles.cell, width: '100px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setConfirmTask(task)}
                    style={styles.deleteSmallButton}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  tableContainer: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#e0dccb',
    padding: '10px 15px',
    borderBottom: '1px solid #ccc',
    fontWeight: 'bold',
    color: '#333',
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
  },
  taskRow: {
    display: 'flex',
    padding: '10px 15px',
    borderBottom: '1px solid #eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: '11px',
    color: '#888',
    marginBottom: '2px',
  },
  taskTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: '13px',
    color: '#555',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#4CAF50',
  },
  assignedText: {
    fontSize: '14px',
    color: '#555',
  },
  dateText: {
    fontSize: '14px',
    color: '#555',
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#888',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '5px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalFooter: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  deleteSmallButton: {
    width: '34px',
    height: '34px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#f44336',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFooterButton: {
    backgroundColor: '#e0dccb',
    color: '#333',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  confirmContent: {
    backgroundColor: 'white',
    padding: '18px',
    borderRadius: '8px',
    width: '420px',
    maxWidth: '90%',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    transition: 'transform 160ms ease, opacity 160ms ease',
  },
  cancelButton: {
    backgroundColor: '#eee',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default TasksPage;
