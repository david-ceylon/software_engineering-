import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileModal from './ProfileModal';
import CalendarWidget from './CalendarWidget';
import BudgetWidget from './BudgetWidget';
import TaskListWidget from './TaskListWidget';
import TasksPage from './TasksPage';
import GuestsPage from './GuestsPage';

function Dashboard({ user, onLogout }) {
  // États Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // États Tâches & Membres
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', desc: '', due_date: '' });
  const [members, setMembers] = useState([]); 

  // États Invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [profileOpen, setProfileOpen] = useState(false);

  // --- Chargement des Données ---
  const reloadData = async (userId, weddingId) => {
    try {
        const resTasks = await fetch(`http://localhost:5001/tasks/${userId}`);
        setTasks(await resTasks.json());

        if (weddingId) {
            const resMembers = await fetch(`http://localhost:5001/wedding/${weddingId}/members?t=${Date.now()}`);
            const membersData = await resMembers.json();
            console.log("Members loaded:", membersData);
            setMembers(membersData);
        }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
      if (user) reloadData(user.id, user.wedding_id); 
  }, [user]);

  // --- Actions Tâches ---
  const toggleStatus = async (task) => {
    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
    await fetch(`http://localhost:5001/tasks/${task.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, user_id: user.id }),
    });
    reloadData(user.id, user.wedding_id); 
  };

  const addTask = async (taskData) => {
      const newTask = {
          user_id: user.id,
          title: taskData?.title || 'New Task',
          description: taskData?.description || '',
          due_date: taskData?.due_date || new Date().toISOString().split('T')[0],
          assigned_to: taskData?.assigned_to || user.id
      };
      
      await fetch('http://localhost:5001/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
      });
      reloadData(user.id, user.wedding_id);
  };

  const updateTask = async (updatedTask) => {
      await fetch(`http://localhost:5001/tasks/${updatedTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedTask, user_id: user.id })
      });
      reloadData(user.id, user.wedding_id);
  };

  const deleteTask = async (taskId) => {
      await fetch(`http://localhost:5001/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      reloadData(user.id, user.wedding_id);
  };

  // --- Invitation ---
  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: inviteEmail, 
            currentUserId: user.id,
            role: inviteRole
        }),
      });
      const data = await res.json();
      alert(res.ok ? data.message : data.error);
      setInviteEmail('');
      reloadData(user.id, user.wedding_id); 
    } catch (err) { alert("Erreur serveur"); }
  };

  const isCollaborator = user?.role === 'collaborator';

  // --- Calcul du Titre du Mariage ---
  const admins = members.filter(m => m.role === 'admin' || m.role === 'Admin');
  let weddingTitle = "Wedding";
  if (admins.length >= 2) {
      weddingTitle = `${admins[0].name} & ${admins[1].name} Wedding`;
  } else if (admins.length === 1) {
      weddingTitle = `${admins[0].name} Wedding`;
  }

  // --- Render Content based on role / active tab ---
  const renderContent = () => {
    if (isCollaborator) {
      // Collaborator: single-task view, no tabs, no sidebar in spirit
      return (
        <div style={styles.collabWrapper}>
          <TasksPage 
            tasks={tasks} 
            members={members} 
            onAddTask={addTask} 
            onUpdateTask={updateTask} 
            onDeleteTask={deleteTask}
            onToggleStatus={toggleStatus}
            user={user}
            weddingTitle={weddingTitle}
          />
        </div>
      );
    }

    switch(activeTab) {
      case 'dashboard':
        return (
          <div style={styles.dashboardContent}>
            <div style={styles.mainArea}>
              <CalendarWidget />
              <BudgetWidget />
            </div>
            <TaskListWidget tasks={tasks} user={user} onToggleStatus={toggleStatus} />
          </div>
        );
      case 'guests':
        return <GuestsPage user={user} members={members} />;
      case 'vendors':
        return <div style={styles.placeholder}><h2>🏪 Vendors</h2><p>Coming soon...</p></div>;
      case 'tasks':
        return (
          <TasksPage 
              tasks={tasks} 
              members={members} 
              onAddTask={addTask} 
              onUpdateTask={updateTask} 
              onDeleteTask={deleteTask}
              onToggleStatus={toggleStatus}
              user={user}
              weddingTitle={weddingTitle}
            />
        );
      case 'calendar':
        return <div style={styles.placeholder}><h2>📅 Calendar</h2><p>Coming soon...</p></div>;
      case 'budget':
        return <div style={styles.placeholder}><h2>💰 Budget</h2><p>Coming soon...</p></div>;
      default:
        return null;
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar hidden for collaborators */}
      {!isCollaborator && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
      
      {/* Main Content */}
      <div style={styles.mainContainer}>
        {/* Header */}
        <Header 
            user={user} 
            onLogout={onLogout} 
            onProfileClick={() => setProfileOpen(true)} 
            weddingTitle={weddingTitle}
        />
        {profileOpen && (
          <ProfileModal
            user={user}
            onClose={() => setProfileOpen(false)}
            onDeleteAccount={() => { setProfileOpen(false); onLogout(); }}
            onInvite={() => reloadData(user.id, user.wedding_id)}
          />
        )}
        
        {/* Content Area */}
        <div style={styles.contentArea}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f3eb',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    padding: '25px',
    overflowY: 'auto',
  },
  dashboardContent: {
    display: 'flex',
    gap: '30px',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  collabWrapper: {
    width: '100%',
  }
};

export default Dashboard;
