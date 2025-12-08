import React from 'react';

function TaskListWidget({ tasks, user, onToggleStatus }) {
  // Trier les tâches: non terminées en haut, terminées en bas
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'Done' && b.status !== 'Done') return 1;
    if (a.status !== 'Done' && b.status === 'Done') return -1;
    return 0;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Task list</h2>
      <div style={styles.taskList}>
        {sortedTasks.slice(0, 6).map((task) => (
          <div key={task.id} style={styles.taskItem}>
            <input 
              type="checkbox" 
              checked={task.status === 'Done'}
              onChange={() => onToggleStatus(task)}
              style={styles.checkbox}
            />
            <div style={styles.taskContent}>
              <span style={{
                ...styles.taskName,
                textDecoration: task.status === 'Done' ? 'line-through' : 'none',
              }}>
                {task.title}
              </span>
              <span style={styles.taskDate}>{task.due_date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '220px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#4a4a4a',
    marginBottom: '15px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '12px 15px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#8b9a6b',
  },
  taskContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  taskName: {
    fontSize: '14px',
    color: '#4a4a4a',
    fontWeight: '500',
  },
  taskDate: {
    fontSize: '12px',
    color: '#888',
  },
};

export default TaskListWidget;
